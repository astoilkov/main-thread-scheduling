import SchedulingPriority from '../SchedulingPriority'
import Task from './Task'
import withResolvers from '../utils/withResolvers'
import schedulingState from '../schedulingState'
import { startTracking } from '../tracking'

/**
 * Adds a task to the queue and returns the new task.
 * @param priority {SchedulingPriority} The priority of the new task.
 */
export default function createTask(priority: SchedulingPriority): Task {
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
