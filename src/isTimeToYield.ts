import state from './state'
import hasValidContext from './hasValidContext'

// #performance
// calling `isTimeToYield()` thousand of times is slow. `lastCall` helps to run logic inside of
// `isTimeToYield()` at most 1 per millisecond.
let lastCallTime = 0
let lastResult = false

/**
 * Determines if it's time to call `yieldControl()`.
 */
export default function isTimeToYield(priority: 'background' | 'user-visible'): boolean {
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
        state.frameTimeElapsed = true
    }

    return lastResult
}

function calculateDeadline(priority: 'background' | 'user-visible'): number {
    if (state.frameWorkStartTime === undefined) {
        // silentError()
        return -1
    }

    switch (priority) {
        case 'user-visible': {
            // Math.round(100 - (1000/60)) = Math.round(83,333) = 83
            return state.frameWorkStartTime + 83
        }
        case 'background': {
            const idleDeadline =
                state.idleDeadline === undefined
                    ? Number.MAX_SAFE_INTEGER
                    : Date.now() + state.idleDeadline.timeRemaining()
            return Math.min(state.frameWorkStartTime + 5, idleDeadline)
        }
        // istanbul ignore next
        default:
            throw new Error('Unreachable code')
    }
}
