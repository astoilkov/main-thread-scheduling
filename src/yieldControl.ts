import schedulingState from './schedulingState'
import queueTask from './utils/queueTask'
import isTimeToYield from './isTimeToYield'
import hasValidContext from './utils/hasValidContext'
import SchedulingStrategy from './SchedulingStrategy'
import { cancelPromiseEscape, requestPromiseEscape } from './utils/promiseEscape'
import createTask from './tasks/createTask'
import removeTask from './tasks/removeTask'
import { nextTask } from './tasks/nextTask'

let promiseEscapeId: number | undefined

/**
 * Waits for the browser to become idle again in order to resume work. Calling `yieldControl()`
 * multiple times will create a LIFO(last in, first out) queue – the last call to
 * `yieldControl()` will get resolved first.
 *
 * @param priority {SchedulingStrategy} The priority of the task being run.
 * `smooth` priority will always be resolved first. `background` priority will always be
 * resolved second.
 * @returns {Promise<void>} A promise that gets resolved when the work can continue.
 */
export default async function yieldControl(priority: SchedulingStrategy = 'smooth'): Promise<void> {
    if (!hasValidContext()) {
        return
    }

    cancelPromiseEscape(promiseEscapeId)

    const task = createTask(priority)

    await schedule(priority)

    if (schedulingState.tasks[0] !== task) {
        await task.promise

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

async function schedule(priority: SchedulingStrategy): Promise<void> {
    if (schedulingState.isThisFrameBudgetSpent) {
        await schedulingState.onAnimationFrame.promise
    }

    if (
        priority === 'smooth' ||
        priority === 'interactive' ||
        typeof requestIdleCallback === 'undefined'
    ) {
        await new Promise<void>((resolve) => queueTask(resolve))

        // istanbul ignore if
        if (navigator.scheduling?.isInputPending?.() === true) {
            await schedule(priority)
        } else if (schedulingState.thisFrameWorkStartTime === undefined) {
            schedulingState.thisFrameWorkStartTime = Date.now()
        }
    } else {
        await schedulingState.onIdleCallback.promise

        // not checking for `navigator.scheduling?.isInputPending?.()` here because idle callbacks
        // ensure no input is pending

        if (schedulingState.thisFrameWorkStartTime === undefined) {
            schedulingState.thisFrameWorkStartTime = Date.now()
        }
    }
}
