import withResolvers from './utils/withResolvers'
import { queueTask } from '../index'

class FrameTracker {
    #resolve: () => void
    #promise: Promise<void>
    #timeoutId?: number
    #requestAnimationId?: number

    constructor() {
        const { promise, resolve } = withResolvers()
        this.#promise = promise
        this.#resolve = resolve
    }

    async waitAnimationFrame(): Promise<void> {
        return this.#promise
    }

    async waitAfterFrame(): Promise<void> {
        await this.#promise
        await new Promise<void>((resolve) => queueTask(resolve))
    }

    start(): void {
        if (this.#requestAnimationId !== undefined) {
            return
        }

        this.#loop()
        clearTimeout(this.#timeoutId)

        this.#timeoutId = undefined
    }

    requestStop(): void {
        if (this.#timeoutId === undefined) {
            this.#timeoutId = setTimeout(() => {
                this.#timeoutId = undefined
                if (this.#requestAnimationId !== undefined) {
                    cancelAnimationFrame(this.#requestAnimationId)
                }
            }, 200)
        }
    }

    #loop(): void {
        this.#requestAnimationId = requestAnimationFrame(() => {
            this.#resolve()

            const { promise, resolve } = withResolvers()
            this.#promise = promise
            this.#resolve = resolve

            this.#loop()
        })
    }
}

const frameTracker = new FrameTracker()

export default frameTracker
