import { isTimeToYield, withResolvers, yieldControl, yieldOrContinue } from './index'

let hasValidContext = true
jest.mock('./src/utils/hasValidContext', () => {
    return jest.fn(() => hasValidContext)
})

describe('main-thread-scheduling', () => {
    beforeEach(() => {
        ;(window as any).MessageChannel = MessageChannelMock
    })

    afterEach(async () => {
        // wait for tracking mechanism to stop
        await watest(20)
        ;(window as any).MessageChannel = undefined
    })

    test(`isTimeToYield('smooth') is true by default`, () => {
        expect(isTimeToYieldMocked('smooth')).toBe(true)
    })

    test(`yieldControl('smooth')`, async () => {
        await yieldControl('smooth')

        expect(isTimeToYieldMocked('smooth')).toBe(false)
    })

    test(`yieldOrContinue('smooth') in a loop`, async () => {
        const now = Date.now()

        while (Date.now() - now < 20) {
            await yieldOrContinue('smooth')
        }
    })

    test(`yieldControl('idle')`, async () => {
        await yieldControl('idle')

        expect(isTimeToYieldMocked('idle')).toBe(false)
    })

    describe('with requestIdleCallback() mock', () => {
        beforeEach(() => {
            ;(window as any).requestIdleCallback = (callback: IdleRequestCallback) => {
                const now = performance.now()
                return window.setTimeout(() => {
                    callback({
                        didTimeout: false,
                        timeRemaining(): DOMHighResTimeStamp {
                            return now + 10
                        },
                    })
                }, 2)
            }
            ;(window as any).cancelIdleCallback = (id: number) => {
                window.clearTimeout(id)
            }
        })

        afterEach(async () => {
            // wait for tracking mechanism to stop
            await watest(20)
            ;(window as any).requestIdleCallback = undefined
            ;(window as any).cancelIdleCallback = undefined
        })

        test(`isTimeToYield('idle') is true by default`, () => {
            expect(isTimeToYieldMocked('idle')).toBe(true)
        })

        test(`yieldControl('idle')`, async () => {
            await yieldControl('idle')

            expect(isTimeToYieldMocked('idle')).toBe(false)
        })

        test(`yieldOrContinue('idle') in a loop`, async () => {
            const now = Date.now()

            while (Date.now() - now < 20) {
                await yieldOrContinue('idle')
            }
        })

        test('tests second schedule() call in yieldControl() method', async () => {
            ;(navigator as any).scheduling = {
                isInputPending: () => true,
            }

            await Promise.all([yieldControl('idle'), yieldControl('idle')])
            ;(navigator as any).scheduling = undefined
        })
    })

    describe(`with isInputPending() mock`, () => {
        let isInputPending = false

        beforeEach(() => {
            ;(navigator as any).scheduling = {
                isInputPending: () => isInputPending,
            }
        })

        afterEach(() => {
            isInputPending = false
            ;(navigator as any).scheduling = undefined
        })

        test(`isTimeToYield() returns true when isInputPending() returns true`, async () => {
            await yieldOrContinue('smooth')

            isInputPending = true

            expect(isTimeToYieldMocked('smooth')).toBe(true)
        })
    })

    describe('withResolvers()', () => {
        test('async resolve()', async () => {
            const { promise, resolve } = withResolvers<number>()

            await resolve(1)

            expect(await promise).toBe(1)
        })

        test('reject()', async () => {
            const { promise, reject } = withResolvers()

            reject(new Error('dummy'))

            await expect(promise).rejects.toThrow('dummy')
        })
    })
})

async function watest(milliseconds: number): Promise<void> {
    return await new Promise<void>((resolve) => setTimeout(resolve, milliseconds))
}

function isTimeToYieldMocked(priority: 'idle' | 'smooth'): boolean {
    const originalDateNow = Date.now

    Date.now = () => Math.random()

    const result = isTimeToYield(priority)

    Date.now = originalDateNow

    return result
}

class MessageChannelMock {
    port1: {
        onmessage?(): void
    } = {}
    port2: {
        postMessage(): void
    }

    constructor() {
        const postMessage = (): void => {
            setTimeout(() => {
                this.port1.onmessage?.()
            }, 1)
        }

        this.port2 = { postMessage }
    }
}
