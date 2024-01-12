import schedulingState from '../schedulingState'

/**
 * Resolve the last task in the queue. This triggers executing the task by resolving the promise
 * inside `yieldControl()` function.
 */
export function nextTask(): void {
    const task = schedulingState.tasks[0]
    if (task !== undefined) {
        task.resolve()
    }
}
