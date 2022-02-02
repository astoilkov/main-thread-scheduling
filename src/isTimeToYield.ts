// #performance
// calling `isTimeToYield()` thousand of times is slow. `lastCalls` helps to run logic inside of
// `isTimeToYield()` at most 1 per millisecond.
import { getIdlePhase, IdlePhase } from './phaseTracking'

let lastCall = 0
let lastResult = false

/**
 * Determines if it's time to call `yieldControl()`.
 */
export default function isTimeToYield(priority: 'background' | 'user-visible'): boolean {
    const now = Date.now()

    if (now - lastCall === 0) {
        return lastResult
    }

    const idlePhase = getIdlePhase()

    lastCall = now
    lastResult =
        idlePhase === undefined ||
        now >= calculateDeadline(priority, idlePhase) ||
        navigator.scheduling?.isInputPending?.() === true

    return lastResult
}

function calculateDeadline(priority: 'background' | 'user-visible', idlePhase: IdlePhase): number {
    const maxTime =
        priority === 'background'
            ? 5
            : // Math.round(100 - (1000/60)) = Math.round(83,333) = 83
              83
    return navigator.scheduling?.isInputPending === undefined
        ? // if `isInputPending()` isn't supported, don't go spend more than the idle deadline is
          // suggesting. otherwise, the app couldn't ensure responsiveness
          idlePhase.start + Math.min(idlePhase.deadline.timeRemaining(), maxTime)
        : // if `isInputPending()` is supported, just give the time it needs based on the priority
          idlePhase.start + maxTime
}
