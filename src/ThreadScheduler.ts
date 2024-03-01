import WorkCycleTracker from './WorkCycleTracker'
import ReactiveTask from './utils/ReactiveTask'
import type ScheduledTask from './ScheduledTask'
import type SchedulingTask from './SchedulingTask'
import withResolvers from './utils/withResolvers'

class ThreadScheduler {
    #tasks: ScheduledTask[] = []
    #topTask: ReactiveTask = new ReactiveTask()
    #workCycleTracker = new WorkCycleTracker()

    constructor() {
        this.#topTask.setEffect(async (task, signal) => {
            this.#workCycleTracker.startTracking()

            await this.#completeTask(task, signal)

            if (this.#tasks.length === 0) {
                this.#workCycleTracker.requestStopTracking()
            }
        })
    }

    schedule(task: SchedulingTask): ScheduledTask {
        const scheduled = { ...task, ...withResolvers() }

        this.#insertTask(scheduled)
        task.signal?.addEventListener(
            'abort',
            () => {
                this.#removeTask(scheduled)
                scheduled.reject(new DOMException('The operation was aborted.', 'AbortError'))
            },
            { once: true },
        )

        return scheduled
    }

    isTimeToYield(task: SchedulingTask): boolean {
        return !this.#workCycleTracker.canWorkMore(task)
    }

    async #completeTask(task: ScheduledTask, signal: AbortSignal): Promise<void> {
        while (!this.#workCycleTracker.canWorkMore(task)) {
            await this.#workCycleTracker.nextWorkCycle(task)

            if (signal.aborted) {
                return
            }
        }

        task.resolve()

        // - wait for the user code to continue running to see if it will add more work to
        //   be done. we prefer this, over continuing to the next task immediately
        // - if called at the end of an async method, it will wait for the async to get resolved in the
        //   parent method that called it and will execute the provided callback in the next microtask.
        await new Promise<void>((resolve) => {
            queueMicrotask(() => {
                queueMicrotask(() => {
                    resolve()
                })
            })
        })

        this.#removeTask(task)
    }

    #insertTask(task: ScheduledTask): void {
        const priority = task.priority
        for (let i = 0; i < this.#tasks.length; i++) {
            if (priority >= this.#tasks[i]!.priority) {
                this.#tasks.splice(i, 0, task)
                this.#topTask.set(this.#tasks[0])
                return
            }
        }
        this.#tasks.push(task)
        this.#topTask.set(this.#tasks[0])
    }

    #removeTask(task: ScheduledTask): void {
        const index = this.#tasks.indexOf(task)
        if (index !== -1) {
            this.#tasks.splice(index, 1)
        }
        if (index === 0) {
            this.#topTask.set(this.#tasks[0])
        }
    }
}

const threadScheduler = new ThreadScheduler()

export default threadScheduler
