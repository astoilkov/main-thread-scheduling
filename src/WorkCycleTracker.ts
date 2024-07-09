import frameTracker from './frameTracker'
import waitNextTaskWhileHidden from './utils/waitNextTaskWhileHidden'
import type SchedulingTask from './SchedulingTask'

export default class WorkCycleTracker {
    #workCycleStart: number = -1
    #idleDeadline?: IdleDeadline

    startTracking(): void {
        frameTracker.start()
    }

    requestStopTracking(): void {
        frameTracker.requestStop()
    }

    canWorkMore(task: SchedulingTask): boolean {
        return !this.#isInputPending() && this.#calculateDeadline(task) - Date.now() > 0
    }

    async nextWorkCycle(task: SchedulingTask): Promise<void> {
        do {
            if (task.type === 'frame-based') {
                // we use waitHiddenTask() because requestAnimationFrame() doesn't
                // fire when page is hidden
                await Promise.race([frameTracker.waitAfterFrame(), waitNextTaskWhileHidden()])
            } else if (task.type === 'idle-based') {
                if (typeof requestIdleCallback === 'undefined') {
                    // todo: use waitHiddenTask() with a timeout
                    await frameTracker.waitAfterFrame()
                } else {
                    this.#idleDeadline = await this.#idleCallback()
                }
            }
        } while (this.#isInputPending())

        this.#workCycleStart = Date.now()
    }

    #calculateDeadline(task: SchedulingTask): number {
        if (task.type === 'frame-based') {
            // const timePerFrame = 1000 / fps.guessRefreshRate()
            // const multiplier = timePerFrame / fps.guessRefreshRate()
            // const maxWorkTime = fps.fps() * multiplier
            // return this.#workCycleStart + maxWorkTime
            return this.#workCycleStart + task.workTime
        } else if (task.type === 'idle-based') {
            const idleDeadline =
                this.#idleDeadline === undefined
                    ? Number.MAX_SAFE_INTEGER
                    : Date.now() + this.#idleDeadline.timeRemaining()
            return Math.min(this.#workCycleStart + task.workTime, idleDeadline)
        }
        return -1
    }

    #isInputPending(): boolean {
        return navigator.scheduling?.isInputPending?.() === true
    }

    #idleCallback(): Promise<IdleDeadline> {
        return new Promise((resolve) => {
            requestIdleCallback((deadline) => {
                resolve(deadline)
            })
        })
    }
}
