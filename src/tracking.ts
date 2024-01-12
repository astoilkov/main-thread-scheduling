import state from './state'
import withResolvers from './utils/withResolvers'

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

                state.onIdleCallback = withResolvers()
            })
        }

        requestAnimationFrame(() => {
            reset()

            state.onAnimationFrame.resolve()

            state.onAnimationFrame = withResolvers()

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
