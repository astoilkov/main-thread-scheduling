import { yieldToMainThread } from './index'

describe('main-thread-scheculing', () => {
    let requestIdleCallbackMock = createRequestIdleCallbackMock()

    beforeEach(() => {
        requestIdleCallbackMock.mockRestore()

        requestIdleCallbackMock = createRequestIdleCallbackMock()
    })

    it(`yieldToMainThread('background')`, async () => {
        const jestFn = jest.fn()

        const ready = (async () => {
            await yieldToMainThread('background')

            jestFn()
        })()

        await wait()

        requestIdleCallbackMock.callRequestIdleCallback(0, false)

        await ready

        expect(jestFn.mock.calls.length).toBe(1)
    })
})

async function wait() {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve()
        }, 100)
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
