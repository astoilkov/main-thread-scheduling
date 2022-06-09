import { getStartTime } from './startTime'
import { getLastIdleDeadline } from './idleFrameTracking'
import { getLastAnimationFrameTime } from './animationFrameTracking'

const isInputPending = navigator.scheduling?.isInputPending
const isFramePending = navigator.scheduling?.isFramePending

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
    lastResult =
        now >= calculateDeadline(priority) ||
        isInputPending?.() === true ||
        (priority === 'background' && isFramePending?.() === true)

    return lastResult
}

function calculateDeadline(priority: 'background' | 'user-visible'): number {
    const startTime = getStartTime()

    switch (priority) {
        case 'user-visible': {
            const lastAnimationFrameTime = getLastAnimationFrameTime()
            return lastAnimationFrameTime === undefined
                ? startTime + 50
                : // Math.round(100 - (1000/60)) = Math.round(83,333) = 83
                  lastAnimationFrameTime + 83
        }
        case 'background': {
            const lastIdleDeadline = getLastIdleDeadline()
            return lastIdleDeadline === undefined
                ? startTime + 5
                : lastIdleDeadline.timeRemaining() === 0
                ? 0
                : Number.MAX_SAFE_INTEGER
        }
        default:
            throw new Error('Unreachable code')
    }
}
