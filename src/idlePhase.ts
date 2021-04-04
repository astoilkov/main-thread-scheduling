export type IdlePhase = {
    start: number
    deadline: IdleDeadline
}

let idlePhase: IdlePhase | undefined
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

export function getIdlePhase(): IdlePhase | undefined {
    return idlePhase
}

export function startTrackingIdlePhase(): void {
    if (status === 'running') {
        throw new Error(`already tracking idle phase. call stopTrackingIdlePhase() first.`)
    }

    // if status was "stop-requested", it's reset to "running"
    status = 'running'
    requestIdleCallback((idleDeadline) => {
        if (status === 'stop-requested') {
            status = 'stopped'
            idlePhase = undefined
        } else {
            idlePhase = {
                deadline: idleDeadline,
                start: performance.now(),
            }

            // setting status to "stopped" so calling startTrackingIdlePhase() doesn't throw
            status = 'stopped'

            startTrackingIdlePhase()
        }
    })
}

export function stopTrackingIdlePhase(): void {
    if (status === 'stopped' || status === 'stop-requested') {
        throw new Error(
            'tracking idle phase is already stopped. call startTrackingIdlePhase() first',
        )
    }

    status = 'stop-requested'
}
