import { getIdlePhase, IdlePhase } from './idlePhase'

// #performance
// calling `isTimeToYield()` thousand of times is slow. `lastCalls` helps to run logic inside of
// `isTimeToYield()` at most 1 per millisecond.
let lastCall = 0

/**
 * Determines if it's time to call `yieldToMainThread()`.
 */
export default function isTimeToYield(priority: 'background' | 'user-visible'): boolean {
    const now = performance.now()

    if (now - lastCall === 0) {
        return false
    }

    lastCall = now

    const idlePhase = getIdlePhase()

    return (
        idlePhase === undefined ||
        now > calculateDeadline(priority, idlePhase) ||
        navigator.scheduling?.isInputPending?.() === true
    )
}

function calculateDeadline(priority: 'background' | 'user-visible', idlePhase: IdlePhase): number {
    const maxTime = priority === 'background' ? 5 : 50
    return navigator.scheduling?.isInputPending === undefined
        ? // if `isInputPending()` isn't supported, don't go spend more than the idle dealine is
          // suggesting. otherwise the app couldn't ensure reponsiveness
          idlePhase.start + Math.min(idlePhase.deadline.timeRemaining(), maxTime)
        : // if `isInputPending()` is supported, just give the time it needs based onthe priority
          idlePhase.start + maxTime
}
