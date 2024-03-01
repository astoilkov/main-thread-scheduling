import type SchedulingStrategy from '../SchedulingStrategy'
import type SchedulingTask from '../SchedulingTask'

export default function toTask(
    schedulingStrategy: SchedulingStrategy,
    signal?: AbortSignal,
): SchedulingTask {
    const options: Record<SchedulingStrategy, SchedulingTask> = {
        interactive: {
            type: 'frame-based',
            workTime: 83,
            priority: 30,
        },
        smooth: {
            type: 'frame-based',
            workTime: 13,
            priority: 20,
        },
        idle: {
            type: 'idle-based',
            workTime: 5,
            priority: 10,
        },
    }
    const task = options[schedulingStrategy]
    task.signal = signal
    return task
}
