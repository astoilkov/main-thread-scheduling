import nextTask from './nextTask'
import isTimeToYield from './isTimeToYield'
import requestLaterMicrotask from './requestLaterMicrotask'
import { notifyScheduleComplete } from './animationFrameTracking'
import { cancelPromiseEscape, requestPromiseEscape } from './promiseEscape'
import { createDeferred, isDeferredLast, nextDeferred, removeDeferred } from './deferred'

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
    cancelPromiseEscape(promiseEscapeId)

    const deferred = createDeferred(priority)

    await schedule(priority)

    notifyScheduleComplete()

    if (!isDeferredLast(deferred)) {
        await deferred.ready

        if (isTimeToYield(priority)) {
            await schedule(priority)
        }
    }

    removeDeferred(deferred)

    cancelPromiseEscape(promiseEscapeId)

    promiseEscapeId = requestPromiseEscape(() => {
        nextDeferred()
    })
}

async function schedule(priority: 'user-visible' | 'background'): Promise<void> {
    if (priority === 'user-visible' || typeof requestIdleCallback === 'undefined') {
        await waitCallback(requestLaterMicrotask)

        await waitCallback(nextTask)
    } else {
        await waitCallback(requestLaterMicrotask)

        await waitCallback(requestIdleCallback)
    }
}

async function waitCallback<T>(
    callback: (callback: () => void, ...args: T[]) => void,
    ...args: T[]
): Promise<void> {
    return new Promise<void>((resolve) => {
        callback(() => {
            resolve()
        }, ...args)
    })
}
