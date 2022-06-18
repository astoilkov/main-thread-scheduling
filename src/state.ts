import { Task } from './tasks'
import whenReady, { WhenReady } from './whenReady'

type State = {
    tasks: Task[]
    frameTimeElapsed: boolean
    onIdleCallback: WhenReady<void>
    onAnimationFrame: WhenReady<void>
    frameWorkStartTime: number | undefined
    idleDeadline: IdleDeadline | undefined
}

const state: State = {
    tasks: [],
    idleDeadline: undefined,
    frameTimeElapsed: false,
    onIdleCallback: whenReady(),
    onAnimationFrame: whenReady(),
    frameWorkStartTime: undefined,
}

export default state
