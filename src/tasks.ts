import schedulingState from './schedulingState'
import { startTracking } from './tracking'
import SchedulingPriority from './SchedulingPriority'
import withResolvers, { PromiseWithResolvers } from './utils/withResolvers'

export type Task = PromiseWithResolvers & {
    priority: SchedulingPriority
}

/**
 * Adds a task to the queue and returns the new task.
 * @param priority {SchedulingPriority} The priority of the new task.
 */
export function createTask(priority: SchedulingPriority): Task {
    const item = { ...withResolvers(), priority }
    const insertIndex =
        priority === 'user-blocking'
            ? 0
            : priority === 'user-visible'
            ? schedulingState.tasks.findIndex(
                  (task) => task.priority === 'user-visible' || task.priority === 'background',
              )
            : schedulingState.tasks.findIndex((task) => task.priority === 'background')

    if (insertIndex === -1) {
        schedulingState.tasks.push(item)
    } else {
        schedulingState.tasks.splice(insertIndex, 0, item)
    }

    if (schedulingState.tasks.length === 1) {
        startTracking()
    }

    return item
}

/**
 * Remove the task from the queue. This happens when we execute this task and it's time for the next
 * one. Call `nextDeferred()` in order to start executing the next task.
 * @param task {Task}
 */
export function removeTask(task: Task): void {
    const index = schedulingState.tasks.indexOf(task)

    if (index !== -1) {
        schedulingState.tasks.splice(index, 1)
    }
}

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
