import SchedulingStrategy from '../SchedulingStrategy'
import ScheduledTask from './ScheduledTask'
import withResolvers from '../utils/withResolvers'
import schedulingState from '../schedulingState'
import { startTracking } from '../tracking'

/**
 * Adds a task to the queue and returns the new task.
 * @param strategy {SchedulingStrategy} The priority of the new task.
 */
export default function createTask(strategy: SchedulingStrategy): ScheduledTask {
    const item = { ...withResolvers(), strategy }
    const insertIndex =
        strategy === 'interactive'
            ? 0
            : strategy === 'smooth'
            ? schedulingState.tasks.findIndex(
                  (task) => task.strategy === 'smooth' || task.strategy === 'idle',
              )
            : schedulingState.tasks.findIndex((task) => task.strategy === 'idle')

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
