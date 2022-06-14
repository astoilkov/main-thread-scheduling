import { isTimeToYield, yieldControl } from './index'

describe('main-thread-scheduling', () => {
    beforeAll(() => {
        createMessageChannelMock()
    })

    it(`isTimeToYield('user-visible') is true by default`, () => {
        expect(isTimeToYieldMocked('user-visible')).toBe(true)
    })

    it(`isTimeToYield('background') is true by default`, () => {
        expect(isTimeToYieldMocked('background')).toBe(true)
    })

    it(`yieldControl('user-visible')`, async () => {
        await yieldControl('user-visible')

        expect(isTimeToYieldMocked('user-visible')).toBe(false)
    })

    it(`yieldControl('background')`, async () => {
        await yieldControl('background')

        expect(isTimeToYieldMocked('background')).toBe(false)
    })

    // it(`calling yieldOrContinue() for the first time should yield to the main thread`, async () => {
    //     const jestFn = jest.fn()
    //
    //     const ready = (async () => {
    //         await yieldOrContinue('background')
    //
    //         jestFn()
    //     })()
    //
    //     await wait()
    //
    //     callAnimationAndIdleFrames(0, false)
    //
    //     await ready
    //
    //     expect(jestFn.mock.calls.length).toBe(1)
    // })
    //
    // it(`calling yieldOrContinue() when there is enough time should resolve immediately`, async () => {
    //     const jestFn = jest.fn()
    //
    //     const ready = (async () => {
    //         await yieldOrContinue('background')
    //
    //         await yieldOrContinue('background')
    //
    //         jestFn()
    //     })()
    //
    //     await wait()
    //
    //     callAnimationAndIdleFrames(100, false)
    //
    //     await ready
    //
    //     expect(jestFn.mock.calls.length).toBe(1)
    // })
    //
    // it(`background tasks should be executed after user-visible tasks`, async () => {
    //     const userVisibleTaskDone = jest.fn()
    //     const backgroundTaskDone = jest.fn()
    //
    //     const ready = (async () => {
    //         await Promise.all([
    //             (async () => {
    //                 await yieldControl('user-visible')
    //
    //                 userVisibleTaskDone()
    //             })(),
    //             (async () => {
    //                 await yieldControl('background')
    //
    //                 backgroundTaskDone()
    //             })(),
    //         ])
    //     })()
    //
    //     await wait()
    //
    //     callAnimationAndIdleFrames(100, false)
    //
    //     await ready
    //
    //     expect(
    //         backgroundTaskDone.mock.invocationCallOrder[0]! >
    //             userVisibleTaskDone.mock.invocationCallOrder[0]!,
    //     ).toBe(true)
    // })
    //
    // it(`tasks wait for next idle callback when there is no time left`, async () => {
    //     const jestFn = jest.fn()
    //
    //     const ready = (async () => {
    //         await yieldControl('background')
    //
    //         await yieldControl('background')
    //
    //         jestFn()
    //     })()
    //
    //     await wait()
    //
    //     callAnimationAndIdleFrames(0, false)
    //
    //     const promise = ready
    //
    //     await wait()
    //
    //     callAnimationAndIdleFrames(0, false)
    //
    //     await promise
    //
    //     expect(jestFn.mock.calls.length).toBe(1)
    // })
    //
    // it(`concurrent tasks wait for next idle callback when there is no time left`, async () => {
    //     const jestFn = jest.fn()
    //
    //     const ready = (async () => {
    //         await Promise.all([yieldControl('background'), yieldControl('background')])
    //
    //         jestFn()
    //     })()
    //
    //     await wait()
    //
    //     callAnimationAndIdleFrames(0, false)
    //
    //     await wait()
    //
    //     callAnimationAndIdleFrames(0, false)
    //
    //     await ready
    //
    //     expect(jestFn.mock.calls.length).toBe(1)
    // })
    //
    // it(`tasks execute in the same browser task when there is enough time`, async () => {
    //     const jestFn = jest.fn()
    //
    //     const ready = (async () => {
    //         await Promise.all([yieldControl('user-visible'), yieldControl('user-visible')])
    //
    //         jestFn()
    //     })()
    //
    //     await wait()
    //
    //     callAnimationAndIdleFrames(1000, false)
    //
    //     await ready
    //
    //     expect(jestFn.mock.calls.length).toBe(1)
    // })
    //
    // it('tracking idle phase stops on the idle callback without pending tasks', async () => {
    //     const jestFn = jest.fn()
    //
    //     const ready = (async () => {
    //         await yieldControl('user-visible')
    //
    //         jestFn()
    //     })()
    //
    //     await wait()
    //
    //     callAnimationAndIdleFrames(0, false)
    //
    //     await wait()
    //
    //     callAnimationAndIdleFrames(0, false)
    //
    //     await ready
    //
    //     expect(jestFn.mock.calls.length).toBe(1)
    // })
    //
    // it('calling startTrackingPhases() twice throws an error', () => {
    //     expect(() => startTrackingAnimationFrames()).not.toThrow()
    //
    //     expect(() => startTrackingAnimationFrames()).toThrow()
    //
    //     // reset state
    //     stopTrackingAnimationFrames()
    // })
    //
    // it('cover the case that stopTrackingPhases() can throw an unreachable code error', () => {
    //     expect(() => stopTrackingAnimationFrames()).toThrow()
    // })
    //
    // it('cover the case that removeDeferred() can throw an unreachable code error', () => {
    //     expect(() =>
    //         removeDeferred({
    //             priority: 'background',
    //             ready: new Promise(() => {}),
    //             resolve: () => {},
    //         }),
    //     ).toThrow()
    // })
    //
    // it(`when isInputPending() is available and returns false – don't yield`, async () => {
    //     ;(navigator as any).scheduling = {
    //         isInputPending: () => false,
    //     }
    //
    //     const jestFn = jest.fn()
    //
    //     const ready = (async () => {
    //         await yieldControl('user-visible')
    //
    //         expect(isTimeToYieldMocked('user-visible')).toBe(false)
    //         expect(isTimeToYieldMocked('background')).toBe(false)
    //
    //         jestFn()
    //     })()
    //
    //     await wait()
    //
    //     callAnimationAndIdleFrames(100, false)
    //
    //     await ready
    //
    //     expect(jestFn.mock.calls.length).toBe(1)
    //     ;(navigator as any).scheduling = undefined
    // })
    //
    // it(`when isInputPending() is available and returns true – yield`, async () => {
    //     ;(navigator as any).scheduling = {
    //         isInputPending: () => true,
    //     }
    //
    //     const jestFn = jest.fn()
    //
    //     const ready = (async () => {
    //         await yieldControl('user-visible')
    //
    //         expect(isTimeToYieldMocked('user-visible')).toBe(true)
    //         expect(isTimeToYieldMocked('background')).toBe(true)
    //
    //         jestFn()
    //     })()
    //
    //     await wait()
    //
    //     callAnimationAndIdleFrames(100, false)
    //
    //     await ready
    //
    //     expect(jestFn.mock.calls.length).toBe(1)
    //     ;(navigator as any).scheduling = undefined
    // })
    //
    // it('isTimeToYield() logic is called once per milisecond, caches result, return true ', async () => {
    //     const promise = yieldControl('user-visible')
    //
    //     await wait()
    //
    //     callAnimationAndIdleFrames(100, false)
    //
    //     await promise
    //
    //     // mock
    //     const orignalDateNow = Date.now
    //     Date.now = () => 100
    //     ;(navigator as any).scheduling = {
    //         isInputPending: () => false,
    //     }
    //
    //     expect(isTimeToYield('user-visible')).toBe(false)
    //
    //     //
    //     ;(navigator as any).scheduling = {
    //         isInputPending: () => true,
    //     }
    //
    //     expect(isTimeToYield('user-visible')).toBe(false)
    //
    //     // unmock
    //     Date.now = orignalDateNow
    //     ;(navigator as any).scheduling = undefined
    // })
    //
    // it(`background task isn't called when it's a timeouted idle callback`, async () => {
    //     const jestFn = jest.fn()
    //
    //     ;(async () => {
    //         await yieldControl('background')
    //
    //         jestFn()
    //     })()
    //
    //     await wait()
    //
    //     callAnimationAndIdleFrames(100, true)
    //
    //     await wait()
    //
    //     expect(jestFn.mock.calls.length).toBe(0)
    //     // expect(isTimeToYieldMocked('background')).toBe(false)
    //
    //     callAnimationAndIdleFrames(100, false)
    //
    //     await wait()
    //
    //     expect(jestFn.mock.calls.length).toBe(1)
    //     // expect(isTimeToYieldMocked('background')).toBe(false)
    // })
    //
    // it('requestIdleCallback is called without requestAnimationFrame before it', async () => {
    //     const jestFn = jest.fn()
    //
    //     ;(async () => {
    //         await yieldControl('background')
    //
    //         jestFn()
    //     })()
    //
    //     await wait()
    //
    //     requestIdleCallbackMock.callRequestIdleCallback(100, false)
    //
    //     await wait()
    //
    //     expect(jestFn.mock.calls.length).toBe(1)
    // })
    //
    // it(`use MessageChannel when requestIdleCallback isn't available`, async () => {
    //     const original = window.requestIdleCallback
    //     // @ts-ignore
    //     window.requestIdleCallback = undefined
    //
    //     const jestFn = jest.fn()
    //
    //     ;(async () => {
    //         await yieldControl('background')
    //
    //         expect(isTimeToYield('background')).toBe(false)
    //
    //         jestFn()
    //     })()
    //
    //     await wait()
    //
    //     requestAnimationFrameMock.callRequestAnimationFrame()
    //
    //     await wait()
    //
    //     messageChannelMock.callMessage()
    //
    //     await wait()
    //
    //     expect(jestFn.mock.calls.length).toBe(1)
    //
    //     window.requestIdleCallback = original
    // })
})

function isTimeToYieldMocked(priority: 'background' | 'user-visible'): boolean {
    const originalDateNow = Date.now

    Date.now = () => Math.random()

    const result = isTimeToYield(priority)

    Date.now = originalDateNow

    return result
}

function createMessageChannelMock() {
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
                }, 0)
            }

            this.port2 = { postMessage }
        }
    }

    ;(window as any).MessageChannel = MessageChannelMock
}
