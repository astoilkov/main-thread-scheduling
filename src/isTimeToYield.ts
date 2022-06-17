import { getLastIdleDeadline, getPerFrameScheduleStartTime } from './tracking'

// #performance
// calling `isTimeToYield()` thousand of times is slow. `lastCall` helps to run logic inside of
// `isTimeToYield()` at most 1 per millisecond.
let lastCallTime = 0
let lastResult = false

/**
 * Determines if it's time to call `yieldControl()`.
 */
export default function isTimeToYield(priority: 'background' | 'user-visible'): boolean {
    // #performance, `performance.now()` is around 40% slower. also `Date.now()` is accurate enough
    // for our use case
    const now = Date.now()

    if (!lastResult && now - lastCallTime === 0) {
        return lastResult
    }

    lastCallTime = now
    lastResult =
        now >= calculateDeadline(priority) || navigator.scheduling?.isInputPending?.() === true

    return lastResult
}

function calculateDeadline(priority: 'background' | 'user-visible'): number {
    const perFrameScheduleStartTime = getPerFrameScheduleStartTime()

    if (perFrameScheduleStartTime === undefined) {
        // silentError()
        return -1
    }

    switch (priority) {
        case 'user-visible': {
            // Math.round(100 - (1000/60)) = Math.round(83,333) = 83
            return perFrameScheduleStartTime + 83
        }
        case 'background': {
            const lastIdleDeadline = getLastIdleDeadline()
            const idleDeadline =
                lastIdleDeadline === undefined
                    ? Number.MAX_SAFE_INTEGER
                    : Date.now() + lastIdleDeadline.timeRemaining()
            return Math.min(perFrameScheduleStartTime + 5, idleDeadline)
        }
        // istanbul ignore next
        default:
            throw new Error('Unreachable code')
    }
}
