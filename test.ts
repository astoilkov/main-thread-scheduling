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

    test(`isTimeToYield('user-visible') is true by default`, () => {
        expect(isTimeToYieldMocked('user-visible')).toBe(true)
    })

    test(`yieldControl('user-visible')`, async () => {
        await yieldControl('user-visible')

        expect(isTimeToYieldMocked('user-visible')).toBe(false)
    })

    test(`yieldOrContinue('user-visible') in a loop`, async () => {
        const now = Date.now()

        while (Date.now() - now < 20) {
            await yieldOrContinue('user-visible')
        }
    })

    test(`yieldControl('background')`, async () => {
        await yieldControl('background')

        expect(isTimeToYieldMocked('background')).toBe(false)
    })

    // todo: move to a separate file without jsdom environment
    test(`check Node.js support`, async () => {
        hasValidContext = false

        try {
            expect(isTimeToYield('user-visible')).toBe(false)
            expect(Promise.race([yieldControl('user-visible'), Promise.resolve(-1)])).not.toBe(-1)
            expect(Promise.race([yieldOrContinue('user-visible'), Promise.resolve(-1)])).not.toBe(
                -1,
            )
        } finally {
            hasValidContext = true
        }
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

        test(`isTimeToYield('background') is true by default`, () => {
            expect(isTimeToYieldMocked('background')).toBe(true)
        })

        test(`yieldControl('background')`, async () => {
            await yieldControl('background')

            expect(isTimeToYieldMocked('background')).toBe(false)
        })

        test(`yieldOrContinue('background') in a loop`, async () => {
            const now = Date.now()

            while (Date.now() - now < 20) {
                await yieldOrContinue('background')
            }
        })

        test('tests second schedule() call in yieldControl() method', async () => {
            ;(navigator as any).scheduling = {
                isInputPending: () => true,
            }

            await Promise.all([yieldControl('background'), yieldControl('background')])
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
            await yieldOrContinue('user-visible')

            isInputPending = true

            expect(isTimeToYieldMocked('user-visible')).toBe(true)
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

function isTimeToYieldMocked(priority: 'background' | 'user-visible'): boolean {
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
