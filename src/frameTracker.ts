import withResolvers, { PromiseWithResolvers } from './utils/withResolvers'
import { queueTask } from '../index'

class FrameTracker {
    #timeoutId?: number
    #requestAnimationId?: number
    #deferred: PromiseWithResolvers

    constructor() {
        this.#deferred = withResolvers()
    }

    async waitAnimationFrame(): Promise<void> {
        return this.#deferred.promise
    }

    async waitAfterFrame(): Promise<void> {
        await this.#deferred.promise
        await new Promise<void>((resolve) => queueTask(resolve))
    }

    start(): void {
        clearTimeout(this.#timeoutId)
        this.#timeoutId = undefined

        if (this.#requestAnimationId === undefined) {
            this.#requestAnimationId = requestAnimationFrame(() => {
                this.#requestAnimationId = undefined

                this.#deferred.resolve()

                this.#deferred = withResolvers()

                this.start()
            })
        }
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
}

const frameTracker = new FrameTracker()

export default frameTracker
