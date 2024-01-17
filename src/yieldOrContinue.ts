import yieldControl from './yieldControl'
import isTimeToYield from './isTimeToYield'
import SchedulingStrategy from './SchedulingStrategy'

/**
 * If there is more time left — immediately returns so the task can continue. If no more time left,
 * it waits for the browser to become idle again in order to resume work. Calling
 * `yieldOrContinue()` multiple times will create a LIFO(last in, first out) queue – the last call
 * to `yieldOrContinue()` will get resolved first.
 *
 * @param priority {SchedulingStrategy} The priority of the task being run.
 * `user-visible` priority will always be resolved first. `background` priority will always be
 * resolved second.
 * @returns {Promise<void>} A promise either immediately resolved or when the browser is ready to
 * do work again.
 */
// disabling ESLint otherwise `requestPromiseEscape()` in `yieldControl()` won't work
// eslint-disable-next-line @typescript-eslint/promise-function-async
export default function yieldOrContinue(priority: SchedulingStrategy = 'smooth'): Promise<void> {
    if (isTimeToYield(priority)) {
        return yieldControl(priority)
    }

    return Promise.resolve()
}
