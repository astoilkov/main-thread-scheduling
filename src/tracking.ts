import state from './state'
import Deferred from './Deferred'

let isTracking = false
let idleCallbackId: number | undefined

export function startTracking(): void {
    // istanbul ignore next
    if (isTracking) {
        return
    }

    isTracking = true

    const reset = (): void => {
        state.idleDeadline = undefined
        state.frameTimeElapsed = false
        state.workStartTimeThisFrame = undefined
    }
    const loop = (): void => {
        if (typeof requestIdleCallback !== 'undefined') {
            idleCallbackId = requestIdleCallback((deadline) => {
                reset()

                state.idleDeadline = deadline

                state.onIdleCallback.resolve()

                state.onIdleCallback = new Deferred()
            })
        }

        requestAnimationFrame(() => {
            reset()

            state.onAnimationFrame.resolve()

            state.onAnimationFrame = new Deferred()

            if (state.tasks.length === 0) {
                isTracking = false

                if (typeof cancelIdleCallback !== 'undefined') {
                    cancelIdleCallback(idleCallbackId)
                }
            } else {
                loop()
            }
        })
    }

    loop()
}
