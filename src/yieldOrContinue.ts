import yieldControl from './yieldControl'
import isTimeToYield from './isTimeToYield'
import SchedulingStrategy from './SchedulingStrategy'

/**
 * If there is more time left — immediately returns so the task can continue. If no more time left,
 * it waits for the browser to become idle again in order to resume work. Calling
 * `yieldOrContinue()` multiple times will create a LIFO(last in, first out) queue – the last call
 * to `yieldOrContinue()` will get resolved first.
 *
 * @param strategy {SchedulingStrategy} The priority of the task being run.
 * `smooth` priority will always be resolved first. `background` priority will always be
 * resolved second.
 * @returns {Promise<void>} A promise either immediately resolved or when the browser is ready to
 * do work again.
 */
// disabling ESLint otherwise `requestPromiseEscape()` in `yieldControl()` won't work
// eslint-disable-next-line @typescript-eslint/promise-function-async
export default function yieldOrContinue(
    strategy: SchedulingStrategy = 'smooth',
    signal?: AbortSignal,
): Promise<void> {
    if (signal?.aborted !== true && isTimeToYield(strategy)) {
        return yieldControl(strategy, signal)
    }

    return Promise.resolve()
}
