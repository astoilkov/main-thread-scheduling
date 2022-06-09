import nextTask from './nextTask'
import waitCallback from './waitCallback'
import isTimeToYield from './isTimeToYield'
import { updateStartTime } from './startTime'
import requestLaterMicrotask from './requestLaterMicrotask'
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
    if (priority === 'user-visible') {
        await waitCallback(requestLaterMicrotask)

        await waitCallback(nextTask)
    } else {
        await waitCallback(requestLaterMicrotask)

        await waitCallback(requestIdleCallback)
    }

    updateStartTime()
}
