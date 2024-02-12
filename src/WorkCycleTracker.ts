import ricTracker from './ricTracker'
import frameTracker from './frameTracker'
import SchedulingStrategy from './SchedulingStrategy'
import waitHiddenTask from './utils/waitHiddenTask'

export default class WorkCycleTracker {
    #workCycleStart: number = -1

    startTracking(): void {
        ricTracker.start()
        frameTracker.start()
    }

    requestStopTracking(): void {
        ricTracker.stop()
        frameTracker.requestStop()
    }

    canWorkMore(strategy: SchedulingStrategy): boolean {
        const isInputPending = navigator.scheduling?.isInputPending?.() === true
        return !isInputPending && this.#calculateDeadline(strategy) - Date.now() > 0
    }

    async nextWorkCycle(strategy: SchedulingStrategy): Promise<void> {
        if (strategy === 'interactive' || strategy === 'smooth') {
            await Promise.race([frameTracker.waitAfterFrame(), waitHiddenTask()])
        } else if (strategy === 'idle') {
            if (ricTracker.available) {
                await ricTracker.waitIdleCallback()
            } else {
                // todo: use waitHiddenTask() with a timeout
                await frameTracker.waitAfterFrame()
            }
        }

        this.#workCycleStart = Date.now()
    }

    #calculateDeadline(strategy: SchedulingStrategy): number {
        if (strategy === 'interactive') {
            return this.#workCycleStart + 83
        } else if (strategy === 'smooth') {
            return this.#workCycleStart + 13
        } else if (strategy === 'idle') {
            const idleDeadline =
                ricTracker.deadline === undefined
                    ? Number.MAX_SAFE_INTEGER
                    : Date.now() + ricTracker.deadline.timeRemaining()
            return Math.min(this.#workCycleStart + 5, idleDeadline)
        }
        return -1
    }
}
