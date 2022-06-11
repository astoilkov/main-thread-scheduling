import { getLastIdleDeadline } from './idleFrameTracking'
import { getPerFrameScheduleStartTime } from './animationFrameTracking'

const isInputPending = navigator.scheduling?.isInputPending

// #performance
// calling `isTimeToYield()` thousand of times is slow. `lastCall` helps to run logic inside of
// `isTimeToYield()` at most 1 per millisecond.
let lastCallTime = 0
let lastResult = false

/**
 * Determines if it's time to call `yieldControl()`.
 */
export default function isTimeToYield(priority: 'background' | 'user-visible'): boolean {
    const now = Date.now()

    if (now - lastCallTime === 0) {
        return lastResult
    }

    lastCallTime = now
    lastResult = now >= calculateDeadline(priority) || isInputPending?.() === true

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
            return lastIdleDeadline === undefined
                ? perFrameScheduleStartTime + 5
                : lastIdleDeadline.timeRemaining() === 0
                ? -1
                : Number.MAX_SAFE_INTEGER
        }
        default:
            throw new Error('Unreachable code')
    }
}
