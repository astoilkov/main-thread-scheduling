export type IdlePhase = {
    start: number
    deadline: IdleDeadline
}

let idlePhase: IdlePhase | undefined
let requestIdleCallbackId: number | undefined

export function getIdlePhase(): IdlePhase | undefined {
    return idlePhase
}

export function startTrackingIdlePhase(): void {
    if (requestIdleCallbackId !== undefined) {
        throw new Error(`you are probably calling startTrackingIdlePhase() a second time`)
    }

    requestIdleCallbackId = requestIdleCallback((idleDeadline) => {
        requestIdleCallbackId = undefined
        idlePhase = {
            deadline: idleDeadline,
            start: performance.now(),
        }

        startTrackingIdlePhase()
    })
}

export function stopTrackingIdlePhase(): void {
    if (requestIdleCallbackId === undefined) {
        throw new Error(
            'you are probably calling stopTrackingIdlePhase() without first calling startTrackingIdlePhase()',
        )
    }
    cancelIdleCallback(requestIdleCallbackId)
}
