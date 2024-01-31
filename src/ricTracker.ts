import withResolvers from './utils/withResolvers'

class RicTracker {
    #promise: Promise<IdleDeadline>
    #resolve: (deadline: IdleDeadline) => void
    #idleCallbackId?: number
    #idleDeadline?: IdleDeadline

    constructor() {
        const { promise, resolve } = withResolvers<IdleDeadline>()
        this.#promise = promise
        this.#resolve = resolve
    }

    get available() {
        return typeof requestIdleCallback !== 'undefined'
    }

    get deadline(): IdleDeadline | undefined {
        return this.#idleDeadline
    }

    async waitIdleCallback(): Promise<IdleDeadline> {
        return this.#promise
    }

    start(): void {
        if (!this.available || this.#idleCallbackId !== undefined) {
            return
        }

        this.#idleCallbackId = requestIdleCallback((deadline) => {
            this.#idleDeadline = deadline
            this.#idleCallbackId = undefined

            this.#resolve?.(deadline)

            const { promise, resolve } = withResolvers<IdleDeadline>()
            this.#promise = promise
            this.#resolve = resolve
        })
    }

    stop() {
        if (this.#idleCallbackId !== undefined) {
            cancelIdleCallback(this.#idleCallbackId)
        }
    }
}

const ricTracker = new RicTracker()

export default ricTracker
