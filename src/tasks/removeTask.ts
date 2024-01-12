import Task from './Task'
import schedulingState from '../schedulingState'

/**
 * Remove the task from the queue. This happens when we execute this task and it's time for the next
 * one. Call `nextDeferred()` in order to start executing the next task.
 * @param task {Task}
 */
export default function removeTask(task: Task): void {
    const index = schedulingState.tasks.indexOf(task)

    if (index !== -1) {
        schedulingState.tasks.splice(index, 1)
    }
}
