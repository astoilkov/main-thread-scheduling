import state from './state'
import isTimeToYield from './isTimeToYield'
import requestNextTask from './requestNextTask'
import { createTask, nextTask, removeTask } from './tasks'
import { cancelPromiseEscape, requestPromiseEscape } from './promiseEscape'

let promiseEscapeId: number | undefined

/**
 * Waits for the browser to become idle again in order to resume work. Calling `yieldControl()`
 * multiple times will create a LIFO(last in, first out) queue – the last call to
 * `yieldControl()` will get resolved first.
 *
 * @param priority {('user-visible' | 'background')} The priority of the task being run.
 * `user-visible` priority will always be resolved first. `background` priority will always be
 * resolved second.
 * @returns {Promise<void>} The promise that will be resolved when the queue
 */
export default async function yieldControl(priority: 'user-visible' | 'background'): Promise<void> {
    // - in Node.js context return immediately
    // - this way we also support test environments (without jsdom added)
    // - support for scheduling in Node.js is still under consideration for future versions
    if (typeof requestAnimationFrame === 'undefined') {
        return
    }

    cancelPromiseEscape(promiseEscapeId)

    const task = createTask(priority)

    await schedule(priority)

    if (state.tasks[0] !== task) {
        await task.ready

        if (isTimeToYield(priority)) {
            await schedule(priority)
        }
    }

    removeTask(task)

    cancelPromiseEscape(promiseEscapeId)

    promiseEscapeId = requestPromiseEscape(() => {
        nextTask()
    })
}

async function schedule(priority: 'user-visible' | 'background'): Promise<void> {
    if (state.frameTimeElapsed) {
        await state.onAnimationFrame.promise
    }

    if (priority === 'user-visible' || typeof requestIdleCallback === 'undefined') {
        await new Promise<void>((resolve) => requestNextTask(resolve))

        // istanbul ignore if
        if (navigator.scheduling?.isInputPending?.() === true) {
            await schedule(priority)
        } else if (state.frameWorkStartTime === undefined) {
            state.frameWorkStartTime = Date.now()
        }
    } else {
        await state.onIdleCallback.promise

        // not checking for `navigator.scheduling?.isInputPending?.()` here because idle callbacks
        // ensure no input is pending

        if (state.frameWorkStartTime === undefined) {
            state.frameWorkStartTime = Date.now()
        }
    }
}
