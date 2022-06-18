import state from './state'
import whenReady from './whenReady'

let isTracking = false
let idleCallbackId: number | undefined

export function startTracking(): void {
    if (isTracking) {
        return
    }

    isTracking = true

    const reset = (): void => {
        state.idleDeadline = undefined
        state.frameTimeElapsed = false
        state.frameWorkStartTime = undefined
    }
    const loop = (): void => {
        idleCallbackId = requestIdleCallback((deadline) => {
            reset()

            state.idleDeadline = deadline

            state.onIdleCallback.resolve()

            state.onIdleCallback = whenReady()
        })

        requestAnimationFrame(() => {
            reset()

            state.onAnimationFrame.resolve()

            state.onAnimationFrame = whenReady()

            if (state.tasks.length === 0) {
                isTracking = false
                cancelIdleCallback(idleCallbackId)
            } else {
                loop()
            }
        })
    }

    loop()
}
