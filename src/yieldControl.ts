import state from './state'
import queueTask from './queueTask'
import isTimeToYield from './isTimeToYield'
import hasValidContext from './hasValidContext'
import SchedulingPriority from './SchedulingPriority'
import { createTask, nextTask, removeTask } from './tasks'
import { cancelPromiseEscape, requestPromiseEscape } from './promiseEscape'

let promiseEscapeId: number | undefined

/**
 * Waits for the browser to become idle again in order to resume work. Calling `yieldControl()`
 * multiple times will create a LIFO(last in, first out) queue – the last call to
 * `yieldControl()` will get resolved first.
 *
 * @param priority {SchedulingPriority} The priority of the task being run.
 * `user-visible` priority will always be resolved first. `background` priority will always be
 * resolved second.
 * @returns {Promise<void>} A promise that gets resolved when the work can continue.
 */
export default async function yieldControl(
    priority: SchedulingPriority = 'user-visible',
): Promise<void> {
    if (!hasValidContext()) {
        return
    }

    cancelPromiseEscape(promiseEscapeId)

    const task = createTask(priority)

    await schedule(priority)

    if (state.tasks[0] !== task) {
        await task.deferred

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

async function schedule(priority: SchedulingPriority): Promise<void> {
    if (state.frameTimeElapsed) {
        await state.onAnimationFrame
    }

    if (
        priority === 'user-visible' ||
        priority === 'user-blocking' ||
        typeof requestIdleCallback === 'undefined'
    ) {
        await new Promise<void>((resolve) => queueTask(resolve))

        // istanbul ignore if
        if (navigator.scheduling?.isInputPending?.() === true) {
            await schedule(priority)
        } else if (state.workStartTimeThisFrame === undefined) {
            state.workStartTimeThisFrame = Date.now()
        }
    } else {
        await state.onIdleCallback

        // not checking for `navigator.scheduling?.isInputPending?.()` here because idle callbacks
        // ensure no input is pending

        if (state.workStartTimeThisFrame === undefined) {
            state.workStartTimeThisFrame = Date.now()
        }
    }
}
