import ScheduledTask from './tasks/ScheduledTask'
import withResolvers, { PromiseWithResolvers } from './utils/withResolvers'

type SchedulingState = {
    tasks: ScheduledTask[]
    isThisFrameBudgetSpent: boolean
    thisFrameWorkStartTime: number | undefined
    onIdleCallback: PromiseWithResolvers
    onAnimationFrame: PromiseWithResolvers
    idleDeadline: IdleDeadline | undefined
}

const schedulingState: SchedulingState = {
    tasks: [],
    idleDeadline: undefined,
    isThisFrameBudgetSpent: false,
    onIdleCallback: withResolvers(),
    onAnimationFrame: withResolvers(),
    thisFrameWorkStartTime: undefined,
}

export default schedulingState
