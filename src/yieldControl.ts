import hasValidContext from './utils/hasValidContext'
import SchedulingStrategy from './SchedulingStrategy'
import scheduler from './Scheduler'

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
export default async function yieldControl(strategy: SchedulingStrategy = 'smooth'): Promise<void> {
    if (!hasValidContext()) {
        return
    }

    const task = scheduler.createTask(strategy)
    return task.promise
}
