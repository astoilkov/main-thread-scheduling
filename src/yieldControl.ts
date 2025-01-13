import hasValidContext from './utils/hasValidContext'
import SchedulingStrategy from './SchedulingStrategy'
import threadScheduler from './ThreadScheduler'
import makeTask from './utils/makeTask'

/**
 * Waits for the browser to become idle again in order to resume work. Calling `yieldControl()`
 * multiple times will create a LIFO(last in, first out) queue – the last call to
 * `yieldControl()` will get resolved first.
 *
 * @param strategy {SchedulingStrategy} The priority of the task being run.
 * `smooth` priority will always be resolved first. `background` priority will always be
 * resolved second.
 * @returns {Promise<void>} A promise that gets resolved when the work can continue.
 */
export default async function yieldControl(
    strategy: SchedulingStrategy = 'smooth',
    signal?: AbortSignal,
): Promise<void> {
    if (!hasValidContext()) {
        return
    }

    return threadScheduler.schedule(makeTask(strategy, signal)).promise
}
