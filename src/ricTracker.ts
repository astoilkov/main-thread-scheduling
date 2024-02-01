import withResolvers, { PromiseWithResolvers } from './utils/withResolvers'

class RicTracker {
    #idleCallbackId?: number
    #idleDeadline?: IdleDeadline
    #deferred: PromiseWithResolvers<IdleDeadline>

    constructor() {
        this.#deferred = withResolvers<IdleDeadline>()
    }

    get available() {
        return typeof requestIdleCallback !== 'undefined'
    }

    get deadline(): IdleDeadline | undefined {
        return this.#idleDeadline
    }

    async waitIdleCallback(): Promise<IdleDeadline> {
        return this.#deferred.promise
    }

    start(): void {
        if (!this.available || this.#idleCallbackId !== undefined) {
            return
        }

        this.#idleCallbackId = requestIdleCallback((deadline) => {
            this.#idleDeadline = deadline
            this.#idleCallbackId = undefined

            this.#deferred.resolve(deadline)

            this.#deferred = withResolvers<IdleDeadline>()

            this.start()
        })
    }

    stop() {
        cancelIdleCallback(this.#idleCallbackId)
        this.#idleCallbackId = undefined
    }
}

const ricTracker = new RicTracker()

export default ricTracker
