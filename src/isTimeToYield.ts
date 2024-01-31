import hasValidContext from './utils/hasValidContext'
import SchedulingStrategy from './SchedulingStrategy'
import scheduler from './Scheduler'

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
export default function isTimeToYield(strategy: SchedulingStrategy = 'smooth'): boolean {
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
    cache.lastResult = scheduler.isTimeToYield(strategy)

    return cache.lastResult
}
