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

        this.#idleCallbackId = requestIdleCallback(
            (deadline) => {
                this.#idleDeadline = deadline
                this.#idleCallbackId = undefined

                this.#deferred.resolve(deadline)

                this.#deferred = withResolvers<IdleDeadline>()

                this.start()
            },
            {
                // wait 3 seconds max to call the next idle callback:
                // - if the browser is actually busy for 3 seconds, we can at least call
                //   rarely and probably the `deadline` will have very little time left
                // - previously Chromium had a bug where it wouldn't fire the idle
                //   callback. the timeout just in case some browser has such a problem.
                timeout: 3000,
            },
        )
    }

    stop() {
        cancelIdleCallback(this.#idleCallbackId)
        this.#idleCallbackId = undefined
    }
}

const ricTracker = new RicTracker()

export default ricTracker
