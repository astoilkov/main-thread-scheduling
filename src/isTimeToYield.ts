import schedulingState from './schedulingState'
import hasValidContext from './utils/hasValidContext'
import SchedulingPriority from './SchedulingPriority'

// #performance
// calling `isTimeToYield()` thousand of times is slow. `lastCall` helps to run logic inside of
// `isTimeToYield()` at most 1 per millisecond.
let lastCallTime = 0
let lastResult = false

/**
 * Determines if it's time to call `yieldControl()`.
 */
export default function isTimeToYield(priority: SchedulingPriority = 'user-visible'): boolean {
    if (!hasValidContext()) {
        return false
    }

    // #performance, `performance.now()` is around 40% slower. also `Date.now()` is accurate enough
    // for our use case
    const now = Date.now()

    if (!lastResult && now - lastCallTime === 0) {
        return lastResult
    }

    lastCallTime = now
    lastResult =
        now >= calculateDeadline(priority) || navigator.scheduling?.isInputPending?.() === true

    if (lastResult) {
        schedulingState.isThisFrameBudgetSpent = true
    }

    return lastResult
}

function calculateDeadline(priority: SchedulingPriority): number {
    if (schedulingState.thisFrameWorkStartTime === undefined) {
        return -1
    }

    switch (priority) {
        case 'user-blocking': {
            // spent the max recommended 100ms doing 'user-blocking' tasks minus 1 frame (16ms):
            // - https://developer.mozilla.org/en-US/docs/Web/Performance/How_long_is_too_long#responsiveness_goal
            // - Math.round(100 - (1000/60)) = Math.round(83,333) = 83
            return schedulingState.thisFrameWorkStartTime + 83
        }
        case 'user-visible': {
            // spent 80% percent of the frame's budget running 'user-visible' tasks:
            // - Math.round((1000/60) * 0.8) = Math.round(13,333) = 13
            return schedulingState.thisFrameWorkStartTime + 13
        }
        case 'background': {
            const idleDeadline =
                schedulingState.idleDeadline === undefined
                    ? Number.MAX_SAFE_INTEGER
                    : Date.now() + schedulingState.idleDeadline.timeRemaining()
            return Math.min(schedulingState.thisFrameWorkStartTime + 5, idleDeadline)
        }
    }
}
