import schedulingState from './schedulingState'
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
        schedulingState.idleDeadline = undefined
        schedulingState.frameTimeElapsed = false
        schedulingState.workStartTimeThisFrame = undefined
    }
    const loop = (): void => {
        if (typeof requestIdleCallback !== 'undefined') {
            idleCallbackId = requestIdleCallback((deadline) => {
                reset()

                schedulingState.idleDeadline = deadline

                schedulingState.onIdleCallback.resolve()

                schedulingState.onIdleCallback = withResolvers()
            })
        }

        requestAnimationFrame(() => {
            reset()

            schedulingState.onAnimationFrame.resolve()

            schedulingState.onAnimationFrame = withResolvers()

            if (schedulingState.tasks.length === 0) {
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
