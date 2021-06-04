import { removeDeferred } from './src/deferred'
import { isTimeToYield, yieldOrContinue, yieldToMainThread } from './index'
import { startTrackingIdlePhase, stopTrackingIdlePhase } from './src/phaseTracking/idlePhaseTracker'

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

    it('calling startTrackingIdlePhase() twice throws an error', () => {
        expect(() => startTrackingIdlePhase()).not.toThrow()

        expect(() => startTrackingIdlePhase()).toThrow()

        // reset state
        stopTrackingIdlePhase()
    })

    it('cover the case that stopTrackingIdlePhase() can throw an unreachable code error', () => {
        expect(() => stopTrackingIdlePhase()).toThrow()
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

            expect(isTimeToYield('user-visible')).toBe(false)
            expect(isTimeToYield('background')).toBe(false)

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

            expect(isTimeToYield('user-visible')).toBe(true)
            expect(isTimeToYield('background')).toBe(true)

            jestFn()
        })()

        await wait()

        requestIdleCallbackMock.callRequestIdleCallback(100, false)

        await ready

        expect(jestFn.mock.calls.length).toBe(1)
        ;(navigator as any).scheduling = undefined
    })
})

async function wait() {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve()
        }, 30)
    })
}

function createRequestIdleCallbackMock() {
    const originalRequestIdleCallback = window.requestIdleCallback
    const originalCancelIdleCallback = window.cancelIdleCallback
    const callbacks: { func: IdleRequestCallback; id: number }[] = []

    let id = 1
    window.requestIdleCallback = (callback, options) => {
        if (options !== undefined) {
            throw new Error(`mock doesn't support passing the second parameter "options"`)
        }

        const callbackId = id
        callbacks.push({ func: callback, id: callbackId })

        id += 1

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
            const pendingCallbacks = [...callbacks]

            callbacks.splice(0, callbacks.length)

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
