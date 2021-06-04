import requestEarlyIdleCallback from './requestFastIdle'

export type IdlePhase = {
    start: number
    deadline: IdleDeadline
}

const idlePhaseTracker = createPhaseTracker((callback: (idlePhase: IdlePhase) => void) => {
    requestIdleCallback((deadline) => {
        callback({
            deadline,
            start: performance.now(),
        })
    })
})

const earlyIdlePhaseTracker = createPhaseTracker((callback: (taskPhase: IdlePhase) => void) => {
    requestEarlyIdleCallback((deadline) => {
        callback({
            deadline,
            start: performance.now(),
        })
    })
})

type PhaseTracker<T> = {
    getPhase: () => T | undefined
    startTracking: () => void
    stopTracking: () => void
}

function createPhaseTracker<T>(
    requestPhase: (callback: (phase: T) => void) => void,
): PhaseTracker<T> {
    let globalPhase: T | undefined

    // Why the "stop-requested" status?
    // - we request to stop the tracking of IdlePhase becuase later in a microtask we may call
    //   `startTrackingIdlePhase()` again. all the steps below happen in a single browser task (in
    //   multiple brwoser micro tasks):
    //   1. `stopTrackingIdlePhase()` is called
    //   2. Promise for `yieldToMainThread()` resolves
    //   3. `yieldToMainThread()` is called again and `startTrackingIdlePhase()` is called
    // - we don't want to cancel with `cancelIdleCallback()` because this would make us call
    //   `requestIdleCallback()` again — this isn't optimal because we can lose free time left in the
    //   currently running idle callback
    let status: 'running' | 'stopped' | 'stop-requested' = 'stopped'

    return {
        getPhase(): T | undefined {
            return globalPhase
        },
        startTracking(): void {
            if (status === 'running') {
                throw new Error('Unreachabe code. This is probably a bug – please log an issue.')
            }

            if (status === 'stop-requested') {
                status = 'running'
                return
            }

            status = 'running'

            requestPhase((phase) => {
                if (status === 'stop-requested') {
                    status = 'stopped'
                    globalPhase = undefined
                } else {
                    globalPhase = phase

                    // setting status to "stopped" so calling startTrackingTaskPhase() doesn't throw
                    status = 'stopped'

                    this.startTracking()
                }
            })
        },
        stopTracking(): void {
            if (status === 'stopped' || status === 'stop-requested') {
                throw new Error('Unreachabe code. This is probably a bug – please log an issue.')
            }

            status = 'stop-requested'
        },
    }
}

export function getIdlePhase(): IdlePhase | undefined {
    return idlePhaseTracker.getPhase() ?? earlyIdlePhaseTracker.getPhase()
}

export function startTrackingPhases(): void {
    earlyIdlePhaseTracker.startTracking()
    idlePhaseTracker.startTracking()
}

export function stopTrackingPhases(): void {
    earlyIdlePhaseTracker.stopTracking()
    idlePhaseTracker.stopTracking()
}
