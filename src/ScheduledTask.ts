import type SchedulingTask from './SchedulingTask'

type ScheduledTask = SchedulingTask & {
    promise: Promise<void>
    resolve: () => void
}

export default ScheduledTask
