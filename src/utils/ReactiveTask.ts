import ScheduledTask from '../ScheduledTask'

// - reactivity for ScheduledTask
// - otherwise, we would have to use something heavier like solid-js
export default class ReactiveTask {
    #task: ScheduledTask | undefined
    #controller = new AbortController()
    #effect: (task: ScheduledTask, signal: AbortSignal) => void = () => {}

    set(task: ScheduledTask | undefined): void {
        if (task === undefined) {
            this.#task = undefined
            this.#controller.abort()
        } else if (this.#task !== task) {
            this.#task = task
            this.#controller.abort()
            this.#controller = new AbortController()
            this.#effect(this.#task, this.#controller.signal)
        }
    }

    setEffect(effect: (task: ScheduledTask, signal: AbortSignal) => Promise<void>): void {
        this.#effect = effect
    }
}
