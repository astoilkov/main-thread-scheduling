import { Task } from './tasks'
import Deferred from './utils/Deferred'

type State = {
    tasks: Task[]
    frameTimeElapsed: boolean
    onIdleCallback: Deferred
    onAnimationFrame: Deferred
    idleDeadline: IdleDeadline | undefined
    workStartTimeThisFrame: number | undefined
}

const state: State = {
    tasks: [],
    idleDeadline: undefined,
    frameTimeElapsed: false,
    onIdleCallback: new Deferred(),
    onAnimationFrame: new Deferred(),
    workStartTimeThisFrame: undefined,
}

export default state
