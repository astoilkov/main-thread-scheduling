import type SchedulingTask from './SchedulingTask'

type ScheduledTask = SchedulingTask & {
    promise: Promise<void>
    resolve: () => void
    reject: (reason: DOMException) => void
}

export default ScheduledTask
