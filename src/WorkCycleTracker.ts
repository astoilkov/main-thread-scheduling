import ricTracker from './ricTracker'
import frameTracker from './frameTracker'
import waitHiddenTask from './utils/waitHiddenTask'
import type SchedulingTask from './SchedulingTask'

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

    canWorkMore(task: SchedulingTask): boolean {
        const isInputPending = navigator.scheduling?.isInputPending?.() === true
        return !isInputPending && this.#calculateDeadline(task) - Date.now() > 0
    }

    async nextWorkCycle(task: SchedulingTask): Promise<void> {
        if (task.type === 'frame-based') {
            await Promise.race([frameTracker.waitAfterFrame(), waitHiddenTask()])
        } else if (task.type === 'idle-based') {
            if (ricTracker.available) {
                await ricTracker.waitIdleCallback()
            } else {
                // todo: use waitHiddenTask() with a timeout
                await frameTracker.waitAfterFrame()
            }
        }

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
                ricTracker.deadline === undefined
                    ? Number.MAX_SAFE_INTEGER
                    : Date.now() + ricTracker.deadline.timeRemaining()
            return Math.min(this.#workCycleStart + task.workTime, idleDeadline)
        }
        return -1
    }
}
