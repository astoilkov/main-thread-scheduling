import { Task } from './tasks'
import withResolvers, { PromiseWithResolvers } from './utils/withResolvers'

type State = {
    tasks: Task[]
    frameTimeElapsed: boolean
    onIdleCallback: PromiseWithResolvers
    onAnimationFrame: PromiseWithResolvers
    idleDeadline: IdleDeadline | undefined
    workStartTimeThisFrame: number | undefined
}

const state: State = {
    tasks: [],
    idleDeadline: undefined,
    frameTimeElapsed: false,
    onIdleCallback: withResolvers(),
    onAnimationFrame: withResolvers(),
    workStartTimeThisFrame: undefined,
}

export default state
