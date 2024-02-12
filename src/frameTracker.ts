import withResolvers, { PromiseWithResolvers } from './utils/withResolvers'
import waitNextTask from './utils/waitNextTask'

class FrameTracker {
    #timeoutId?: number
    #requestAnimationId?: number
    #deferred: PromiseWithResolvers

    constructor() {
        this.#deferred = withResolvers()
    }

    async waitAfterFrame(): Promise<void> {
        await this.#deferred.promise
        await waitNextTask()
    }

    start(): void {
        clearTimeout(this.#timeoutId)
        this.#timeoutId = undefined
        this.#loop()
    }

    requestStop(): void {
        if (this.#timeoutId === undefined) {
            this.#timeoutId = setTimeout(() => {
                this.#timeoutId = undefined
                cancelAnimationFrame(this.#requestAnimationId)
                this.#requestAnimationId = undefined
            }, 200)
        }
    }

    #loop(): void {
        if (this.#requestAnimationId === undefined) {
            this.#requestAnimationId = requestAnimationFrame(() => {
                this.#requestAnimationId = undefined

                this.#deferred.resolve()

                this.#deferred = withResolvers()

                this.#loop()
            })
        }
    }
}

const frameTracker = new FrameTracker()

export default frameTracker
