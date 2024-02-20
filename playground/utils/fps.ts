class FPS {
    #fps = 0
    #frames: number[] = []

    constructor() {
        this.#loop()
    }

    timePerFrame(): number {
        return 1000 / this.fps()
    }

    fps(): number {
        if (this.#fps === 61) {
            return 60
        }
        return this.#fps
    }

    guessRefreshRate(): 60 | 120 {
        return this.#fps >= 70 ? 120 : 60
    }

    #loop(): void {
        requestAnimationFrame(() => {
            this.#loop()
            this.#frames.push(performance.now())

            this.#updateFps()
        })
    }

    #updateFps(): void {
        while (true) {
            const oldestFrame = this.#frames.at(0)
            if (oldestFrame !== undefined && oldestFrame < performance.now() - 1000) {
                this.#frames.shift()
            } else {
                break
            }
        }
        this.#fps = this.#frames.length
    }
}

const fps = new FPS()

export default fps
