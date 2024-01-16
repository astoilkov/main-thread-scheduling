import ScheduledTask from './ScheduledTask'
import schedulingState from '../schedulingState'

/**
 * Remove the task from the queue. This happens when we execute this task and it's time for the next
 * one. Call `nextDeferred()` in order to start executing the next task.
 * @param task {ScheduledTask}
 */
export default function removeTask(task: ScheduledTask): void {
    const index = schedulingState.tasks.indexOf(task)

    if (index !== -1) {
        schedulingState.tasks.splice(index, 1)
    }
}
