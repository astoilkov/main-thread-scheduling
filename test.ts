import { removeDeferred } from './src/deferred'
import { isTimeToYield, yieldOrContinue, yieldToMainThread } from './index'
import { startTrackingPhases, stopTrackingPhases } from './src/phaseTracking'

describe('main-thread-scheculing', () => {
    let requestIdleCallbackMock = createRequestIdleCallbackMock()

    beforeEach(async () => {
        await wait()

        requestIdleCallbackMock.callRequestIdleCallback(100, false)

        await wait()

        requestIdleCallbackMock.mockRestore()

        requestIdleCallbackMock = createRequestIdleCallbackMock()
    })

    it(`calling yieldOrContinue() for the first time should yield to the main thread`, async () => {
        const jestFn = jest.fn()

        const ready = (async () => {
            await yieldOrContinue('background')

            jestFn()
        })()

        await wait()

        requestIdleCallbackMock.callRequestIdleCallback(0, false)

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

        requestIdleCallbackMock.callRequestIdleCallback(100, false)

        await ready

        expect(jestFn.mock.calls.length).toBe(1)
    })

    it(`background tasks should be executed after user-visible tasks`, async () => {
        const userVisibleTaskDone = jest.fn()
        const backgroundTaskDone = jest.fn()

        const ready = (async () => {
            await Promise.all([
                (async () => {
                    await yieldToMainThread('user-visible')

                    userVisibleTaskDone()
                })(),
                (async () => {
                    await yieldToMainThread('background')

                    backgroundTaskDone()
                })(),
            ])
        })()

        await wait()

        requestIdleCallbackMock.callRequestIdleCallback(100, false)

        await ready

        expect(
            backgroundTaskDone.mock.invocationCallOrder[0]! >
                userVisibleTaskDone.mock.invocationCallOrder[0]!,
        ).toBe(true)
    })

    it(`tasks wait for next idle callback when there is no time left`, async () => {
        const jestFn = jest.fn()

        const ready = (async () => {
            await yieldToMainThread('background')

            await yieldToMainThread('background')

            jestFn()
        })()

        await wait()

        requestIdleCallbackMock.callRequestIdleCallback(0, false)

        const promise = ready

        await wait()

        requestIdleCallbackMock.callRequestIdleCallback(0, false)

        await promise

        expect(jestFn.mock.calls.length).toBe(1)
    })

    it(`concurrent tasks wait for next idle callback when there is no time left`, async () => {
        const jestFn = jest.fn()

        const ready = (async () => {
            await Promise.all([yieldToMainThread('background'), yieldToMainThread('background')])

            jestFn()
        })()

        await wait()

        requestIdleCallbackMock.callRequestIdleCallback(0, false)

        await wait()

        requestIdleCallbackMock.callRequestIdleCallback(0, false)

        await ready

        expect(jestFn.mock.calls.length).toBe(1)
    })

    it(`tasks execute in the same browser task when there is enough time`, async () => {
        const jestFn = jest.fn()

        const ready = (async () => {
            await Promise.all([
                yieldToMainThread('user-visible'),
                yieldToMainThread('user-visible'),
            ])

            jestFn()
        })()

        await wait()

        requestIdleCallbackMock.callRequestIdleCallback(1000, false)

        await ready

        expect(jestFn.mock.calls.length).toBe(1)
    })

    it('tracking idle phase stops on the idle callback without pending tasks', async () => {
        const jestFn = jest.fn()

        const ready = (async () => {
            await yieldToMainThread('user-visible')

            jestFn()
        })()

        await wait()

        requestIdleCallbackMock.callRequestIdleCallback(0, false)

        await wait()

        requestIdleCallbackMock.callRequestIdleCallback(0, false)

        await ready

        expect(jestFn.mock.calls.length).toBe(1)
    })

    it('calling startTrackingPhases() twice throws an error', () => {
        expect(() => startTrackingPhases()).not.toThrow()

        expect(() => startTrackingPhases()).toThrow()

        // reset state
        stopTrackingPhases()
    })

    it('cover the case that stopTrackingPhases() can throw an unreachable code error', () => {
        expect(() => stopTrackingPhases()).toThrow()
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
            await yieldToMainThread('user-visible')

            expect(isTimeToYieldMocked('user-visible')).toBe(false)
            expect(isTimeToYieldMocked('background')).toBe(false)

            jestFn()
        })()

        await wait()

        requestIdleCallbackMock.callRequestIdleCallback(100, false)

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
            await yieldToMainThread('user-visible')

            expect(isTimeToYieldMocked('user-visible')).toBe(true)
            expect(isTimeToYieldMocked('background')).toBe(true)

            jestFn()
        })()

        await wait()

        requestIdleCallbackMock.callRequestIdleCallback(100, false)

        await ready

        expect(jestFn.mock.calls.length).toBe(1)
        ;(navigator as any).scheduling = undefined
    })

    it('isTimeToYield() logic is called once per milisecond, caches result, return true ', async () => {
        const promise = yieldToMainThread('user-visible')

        await wait()

        requestIdleCallbackMock.callRequestIdleCallback(100, false)

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
            await yieldToMainThread('background')

            jestFn()
        })()

        await wait()

        requestIdleCallbackMock.callRequestIdleCallback(100, true)

        await wait()

        expect(jestFn.mock.calls.length).toBe(0)
        expect(isTimeToYieldMocked('background')).toBe(false)

        requestIdleCallbackMock.callRequestIdleCallback(100, false)

        await wait()

        expect(jestFn.mock.calls.length).toBe(1)
        expect(isTimeToYieldMocked('background')).toBe(false)
    })
})

// we use wait because:
// - we call `requestLaterMicrotask()` inside of `yieldToMainThread()` that makes
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

function isTimeToYieldMocked(priority: 'background' | 'user-visible'): boolean {
    const originalDateNow = Date.now

    Date.now = () => Math.random()

    const result = isTimeToYield(priority)

    Date.now = originalDateNow

    return result
}
