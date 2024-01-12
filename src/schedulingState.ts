import Task from './tasks/Task'
import withResolvers, { PromiseWithResolvers } from './utils/withResolvers'

type SchedulingState = {
    tasks: Task[]
    frameTimeElapsed: boolean
    onIdleCallback: PromiseWithResolvers
    onAnimationFrame: PromiseWithResolvers
    idleDeadline: IdleDeadline | undefined
    workStartTimeThisFrame: number | undefined
}

const schedulingState: SchedulingState = {
    tasks: [],
    idleDeadline: undefined,
    frameTimeElapsed: false,
    onIdleCallback: withResolvers(),
    onAnimationFrame: withResolvers(),
    workStartTimeThisFrame: undefined,
}

export default schedulingState
