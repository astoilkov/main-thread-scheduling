import schedulingState from './schedulingState'
import hasValidContext from './utils/hasValidContext'
import SchedulingStrategy from './SchedulingStrategy'

// #performance
// calling `isTimeToYield()` thousand of times is slow
// `cache` helps isTimeToYield() run faster
const cache = {
    lastCallTime: 0,
    lastResult: false,
    hasValidContext: undefined as boolean | undefined,
}

/**
 * Determines if it's time to call `yieldControl()`.
 */
export default function isTimeToYield(priority: SchedulingStrategy = 'smooth'): boolean {
    if (cache.hasValidContext === undefined) {
        cache.hasValidContext = hasValidContext()
    }

    if (!cache.hasValidContext) {
        return false
    }

    // #performance, `performance.now()` is around 40% slower. also `Date.now()` is accurate enough
    // for our use case
    const now = Date.now()

    // #performance, call the slow logic of `isTimeToYield` at most 1 per millisecond
    if (!cache.lastResult && now - cache.lastCallTime === 0) {
        return cache.lastResult
    }

    cache.lastCallTime = now
    cache.lastResult =
        now >= calculateDeadline(priority) || navigator.scheduling?.isInputPending?.() === true

    if (cache.lastResult) {
        schedulingState.isThisFrameBudgetSpent = true
    }

    return cache.lastResult
}

function calculateDeadline(priority: SchedulingStrategy): number {
    if (schedulingState.thisFrameWorkStartTime === undefined) {
        return -1
    }

    switch (priority) {
        case 'interactive': {
            // spent the max recommended 100ms doing 'interactive' tasks minus 1 frame (16ms):
            // - https://developer.mozilla.org/en-US/docs/Web/Performance/How_long_is_too_long#responsiveness_goal
            // - Math.round(100 - (1000/60)) = Math.round(83,333) = 83
            return schedulingState.thisFrameWorkStartTime + 83
        }
        case 'smooth': {
            // spent 80% percent of the frame's budget running 'smooth' tasks:
            // - Math.round((1000/60) * 0.8) = Math.round(13,333) = 13
            return schedulingState.thisFrameWorkStartTime + 13
        }
        case 'idle': {
            const idleDeadline =
                schedulingState.idleDeadline === undefined
                    ? Number.MAX_SAFE_INTEGER
                    : Date.now() + schedulingState.idleDeadline.timeRemaining()
            return Math.min(schedulingState.thisFrameWorkStartTime + 5, idleDeadline)
        }
    }
}
