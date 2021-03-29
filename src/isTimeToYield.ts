type IdlePhase = {
    start: number
    deadline: IdleDeadline
}

let idlePhase: IdlePhase | undefined
let earlyIdleCallbackId: number | undefined

/**
 * Determines if it's time to call `yieldToMainThread()`.
 */
export default function isTimeToYield(priority: 'background' | 'user-visible'): boolean {
    if (idlePhase !== undefined && performance.now() < calculateDeadline(priority, idlePhase)) {
        return false
    } else if (earlyIdleCallbackId === undefined) {
        earlyIdleCallbackId = requestIdleCallback((idleDeadline) => {
            earlyIdleCallbackId = undefined
            idlePhase = {
                deadline: idleDeadline,
                start: performance.now(),
            }
        })
    }

    return true
}

function calculateDeadline(priority: 'background' | 'user-visible', idlePhase: IdlePhase): number {
    const maxTime = priority === 'background' ? 5 : 50
    return navigator.scheduling?.isInputPending === undefined
        // if `isInputPending()` isn't supported, don't go spend more than the idle dealine is
        // suggesting. otherwise the app couldn't ensure reponsiveness
        ? idlePhase.start + Math.min(idlePhase.deadline.timeRemaining(), maxTime)
        // if `isInputPending()` is supported, just give the time it needs based onthe priority
        : idlePhase.start + maxTime
}
