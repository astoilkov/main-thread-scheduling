import { removeDeferred } from './src/deferred'
import { isTimeToYield, yieldOrContinue, yieldControl } from './index'
import {
    startTrackingAnimationFrames,
    stopTrackingAnimationFrames,
} from './src/animationFrameTracking'

describe('main-thread-scheduling', () => {
    let messageChannelMock = createMessageChannelMock()
    let requestIdleCallbackMock = createRequestIdleCallbackMock()
    let requestAnimationFrameMock = createRequestAnimationFrameMock()

    function callAnimationAndIdleFrames(timeRemaining: number, didTimeout: boolean): void {
        requestAnimationFrameMock.callRequestAnimationFrame()

        requestIdleCallbackMock.callRequestIdleCallback(timeRemaining, didTimeout)
    }

    beforeEach(async () => {
        await wait()

        callAnimationAndIdleFrames(100, false)

        await wait()

        messageChannelMock.mockRestore()
        requestIdleCallbackMock.mockRestore()
        requestAnimationFrameMock.mockRestore()

        messageChannelMock = createMessageChannelMock()
        requestIdleCallbackMock = createRequestIdleCallbackMock()
        requestAnimationFrameMock = createRequestAnimationFrameMock()
    })

    it(`calling yieldOrContinue() for the first time should yield to the main thread`, async () => {
        const jestFn = jest.fn()

        const ready = (async () => {
            await yieldOrContinue('background')

            jestFn()
        })()

        await wait()

        callAnimationAndIdleFrames(0, false)

        await ready

        expect(jestFn.mock.calls.length).toBe(1)
    })

    it(`calling yieldOrContinue() when there is enough time should resolve immediately`, async () => {
        const jestFn = jest.fn()

        const ready = (async () => {
            await yieldOrContinue('background')

            await yieldOrContinue('background')

            jestFn()
        })()

        await wait()

        callAnimationAndIdleFrames(100, false)

        await ready

        expect(jestFn.mock.calls.length).toBe(1)
    })

    it(`background tasks should be executed after user-visible tasks`, async () => {
        const userVisibleTaskDone = jest.fn()
        const backgroundTaskDone = jest.fn()

        const ready = (async () => {
            await Promise.all([
                (async () => {
                    await yieldControl('user-visible')

                    userVisibleTaskDone()
                })(),
                (async () => {
                    await yieldControl('background')

                    backgroundTaskDone()
                })(),
            ])
        })()

        await wait()

        callAnimationAndIdleFrames(100, false)

        await ready

        expect(
            backgroundTaskDone.mock.invocationCallOrder[0]! >
                userVisibleTaskDone.mock.invocationCallOrder[0]!,
        ).toBe(true)
    })

    it(`tasks wait for next idle callback when there is no time left`, async () => {
        const jestFn = jest.fn()

        const ready = (async () => {
            await yieldControl('background')

            await yieldControl('background')

            jestFn()
        })()

        await wait()

        callAnimationAndIdleFrames(0, false)

        const promise = ready

        await wait()

        callAnimationAndIdleFrames(0, false)

        await promise

        expect(jestFn.mock.calls.length).toBe(1)
    })

    it(`concurrent tasks wait for next idle callback when there is no time left`, async () => {
        const jestFn = jest.fn()

        const ready = (async () => {
            await Promise.all([yieldControl('background'), yieldControl('background')])

            jestFn()
        })()

        await wait()

        callAnimationAndIdleFrames(0, false)

        await wait()

        callAnimationAndIdleFrames(0, false)

        await ready

        expect(jestFn.mock.calls.length).toBe(1)
    })

    it(`tasks execute in the same browser task when there is enough time`, async () => {
        const jestFn = jest.fn()

        const ready = (async () => {
            await Promise.all([yieldControl('user-visible'), yieldControl('user-visible')])

            jestFn()
        })()

        await wait()

        callAnimationAndIdleFrames(1000, false)

        await ready

        expect(jestFn.mock.calls.length).toBe(1)
    })

    it('tracking idle phase stops on the idle callback without pending tasks', async () => {
        const jestFn = jest.fn()

        const ready = (async () => {
            await yieldControl('user-visible')

            jestFn()
        })()

        await wait()

        callAnimationAndIdleFrames(0, false)

        await wait()

        callAnimationAndIdleFrames(0, false)

        await ready

        expect(jestFn.mock.calls.length).toBe(1)
    })

    it('calling startTrackingPhases() twice throws an error', () => {
        expect(() => startTrackingAnimationFrames()).not.toThrow()

        expect(() => startTrackingAnimationFrames()).toThrow()

        // reset state
        stopTrackingAnimationFrames()
    })

    it('cover the case that stopTrackingPhases() can throw an unreachable code error', () => {
        expect(() => stopTrackingAnimationFrames()).toThrow()
    })

    it('cover the case that removeDeferred() can throw an unreachable code error', () => {
        expect(() =>
            removeDeferred({
                priority: 'background',
                ready: new Promise(() => {}),
                resolve: () => {},
            }),
        ).toThrow()
    })

    it(`when isInputPending() is available and returns false – don't yield`, async () => {
        ;(navigator as any).scheduling = {
            isInputPending: () => false,
        }

        const jestFn = jest.fn()

        const ready = (async () => {
            await yieldControl('user-visible')

            expect(isTimeToYieldMocked('user-visible')).toBe(false)
            expect(isTimeToYieldMocked('background')).toBe(false)

            jestFn()
        })()

        await wait()

        callAnimationAndIdleFrames(100, false)

        await ready

        expect(jestFn.mock.calls.length).toBe(1)
        ;(navigator as any).scheduling = undefined
    })

    it(`when isInputPending() is available and returns true – yield`, async () => {
        ;(navigator as any).scheduling = {
            isInputPending: () => true,
        }

        const jestFn = jest.fn()

        const ready = (async () => {
            await yieldControl('user-visible')

            expect(isTimeToYieldMocked('user-visible')).toBe(true)
            expect(isTimeToYieldMocked('background')).toBe(true)

            jestFn()
        })()

        await wait()

        callAnimationAndIdleFrames(100, false)

        await ready

        expect(jestFn.mock.calls.length).toBe(1)
        ;(navigator as any).scheduling = undefined
    })

    it('isTimeToYield() logic is called once per milisecond, caches result, return true ', async () => {
        const promise = yieldControl('user-visible')

        await wait()

        callAnimationAndIdleFrames(100, false)

        await promise

        // mock
        const orignalDateNow = Date.now
        Date.now = () => 100
        ;(navigator as any).scheduling = {
            isInputPending: () => false,
        }

        expect(isTimeToYield('user-visible')).toBe(false)

        //
        ;(navigator as any).scheduling = {
            isInputPending: () => true,
        }

        expect(isTimeToYield('user-visible')).toBe(false)

        // unmock
        Date.now = orignalDateNow
        ;(navigator as any).scheduling = undefined
    })

    it(`background task isn't called when it's a timeouted idle callback`, async () => {
        const jestFn = jest.fn()

        ;(async () => {
            await yieldControl('background')

            jestFn()
        })()

        await wait()

        callAnimationAndIdleFrames(100, true)

        await wait()

        expect(jestFn.mock.calls.length).toBe(0)
        // expect(isTimeToYieldMocked('background')).toBe(false)

        callAnimationAndIdleFrames(100, false)

        await wait()

        expect(jestFn.mock.calls.length).toBe(1)
        // expect(isTimeToYieldMocked('background')).toBe(false)
    })

    it('requestIdleCallback is called without requestAnimationFrame before it', async () => {
        const jestFn = jest.fn()

        ;(async () => {
            await yieldControl('background')

            jestFn()
        })()

        await wait()

        requestIdleCallbackMock.callRequestIdleCallback(100, false)

        await wait()

        expect(jestFn.mock.calls.length).toBe(1)
    })

    it(`use MessageChannel when requestIdleCallback isn't available`, async () => {
        const original = window.requestIdleCallback
        // @ts-ignore
        window.requestIdleCallback = undefined

        const jestFn = jest.fn()

        ;(async () => {
            await yieldControl('background')

            expect(isTimeToYield('background')).toBe(false)

            jestFn()
        })()

        await wait()

        requestAnimationFrameMock.callRequestAnimationFrame()

        await wait()

        messageChannelMock.callMessage()

        await wait()

        expect(jestFn.mock.calls.length).toBe(1)

        window.requestIdleCallback = original
    })
})

// we use wait because:
// - we call `requestLaterMicrotask()` inside of `yieldControl()` that makes
//   `requestIdleCallback()` to not be called immediately. this way we are sure
//   `requestIdleCallback()` has been called
async function wait() {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve()
        }, 30)
    })
}

function createRequestIdleCallbackMock() {
    let globalCallbackId = 1
    let callbacks: {
        id: number
        func: IdleRequestCallback
        options: IdleRequestOptions | undefined
    }[] = []
    let animationFrameCallbacks: { id: number; func: FrameRequestCallback }[] = []

    const originalRequestIdleCallback = window.requestIdleCallback
    const originalCancelIdleCallback = window.cancelIdleCallback

    window.requestIdleCallback = (callback, options) => {
        const callbackId = globalCallbackId
        callbacks.push({ id: callbackId, func: callback, options })

        globalCallbackId += 1

        return callbackId
    }

    window.cancelIdleCallback = (id: number) => {
        const index = callbacks.findIndex((callback) => callback.id === id)

        if (index !== -1) {
            callbacks.splice(index, 1)
        }
    }

    return {
        callRequestIdleCallback(timeRemaining: number, didTimeout: boolean) {
            // call requestAnimationFrame() callbacks
            {
                const pendingAnimationFrameCallbacks = [...animationFrameCallbacks]

                animationFrameCallbacks = []

                for (const pending of pendingAnimationFrameCallbacks) {
                    pending.func(performance.now())
                }
            }

            const pendingCallbacks = didTimeout
                ? callbacks.filter((callback) => typeof callback.options?.timeout === 'number')
                : [...callbacks]

            callbacks = callbacks.filter((callback) => !pendingCallbacks.includes(callback))

            for (const callback of pendingCallbacks) {
                callback.func({ timeRemaining: () => timeRemaining, didTimeout })
            }
        },

        mockRestore() {
            window.cancelIdleCallback = originalCancelIdleCallback
            window.requestIdleCallback = originalRequestIdleCallback
        },
    }
}

function createRequestAnimationFrameMock() {
    let globalCallbackId = 1
    let callbacks: { id: number; func: FrameRequestCallback }[] = []

    const originalRequestAnimationFrame = window.requestAnimationFrame
    const originalCancelAnimationFrame = window.cancelAnimationFrame

    window.requestAnimationFrame = (callback) => {
        const callbackId = globalCallbackId
        callbacks.push({ id: callbackId, func: callback })

        globalCallbackId += 1

        return callbackId
    }

    window.cancelAnimationFrame = (id: number) => {
        const index = callbacks.findIndex((callback) => callback.id === id)

        if (index !== -1) {
            callbacks.splice(index, 1)
        }
    }

    return {
        callRequestAnimationFrame() {
            const pendingCallbacks = [...callbacks]

            callbacks = []

            for (const pending of pendingCallbacks) {
                pending.func(performance.now())
            }
        },

        mockRestore() {
            window.requestAnimationFrame = originalRequestAnimationFrame
            window.cancelAnimationFrame = originalCancelAnimationFrame
        },
    }
}

function createMessageChannelMock() {
    const messageChannels: MessageChannelMock[] = []

    class MessageChannelMock {
        port1: {
            onmessage?: () => void
        } = {}
        port2 = {
            postMessage() {},
        }
        constructor() {
            messageChannels.push(this)
        }
    }

    ;(global as any).MessageChannel = MessageChannelMock

    return {
        callMessage() {
            const pendingChannels = [...messageChannels]

            messageChannels.splice(0, messageChannels.length)

            for (const channel of pendingChannels) {
                channel.port1.onmessage?.()
            }
        },

        mockRestore() {
            ;(global as any).MessageChannel = undefined
        },
    }
}

function isTimeToYieldMocked(priority: 'background' | 'user-visible'): boolean {
    const originalDateNow = Date.now

    Date.now = () => Math.random()

    const result = isTimeToYield(priority)

    Date.now = originalDateNow

    return result
}
