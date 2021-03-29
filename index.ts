import { nextDeferred } from './src/deferred'
import isTimeToYield from './src/isTimeToYield'
import yieldToMainThreadBase from './src/yieldToMainThread'
import { cancelPromiseEscape, requestPromiseEscape } from './src/promiseEscape'

let promiseEscapeId: number | undefined

/**
 * It either calls `yieldToMainThread()` because there isn't any more time left or it does nothing
 * if there is more time left.
 *
 * @param priority {('user-visible' | 'background')} The priority of the task being run.
 * `user-visible` priority will always be resolved first. `background` priority will always be
 * resolved second.
 * @returns {Promise<void>} The promise that will be resolved when the queue
 */
export async function yieldOrContinue(priority: 'background' | 'user-visible'): Promise<void> {
    cancelPromiseEscape(promiseEscapeId)

    if (isTimeToYield(priority)) {
        await yieldToMainThreadBase(priority)
    }

    cancelPromiseEscape(promiseEscapeId)

    promiseEscapeId = requestPromiseEscape(() => {
        nextDeferred()
    })
}

/**
 * Waits for the browser to become idle again in order to resume work. Calling `yieldToMainThread()`
 * multiple times will create a LIFO(last in, first out) queue – the last call to
 * `yieldToMainThread()` will get resolved first.
 *
 * @param priority {('user-visible' | 'background')} The priority of the task being run.
 * `user-visible` priority will always be resolved first. `background` priority will always be
 * resolved second.
 * @returns {Promise<void>} The promise that will be resolved when the queue
 */
export async function yieldToMainThread(priority: 'background' | 'user-visible'): Promise<void> {
    cancelPromiseEscape(promiseEscapeId)

    await yieldToMainThreadBase(priority)

    cancelPromiseEscape(promiseEscapeId)

    promiseEscapeId = requestPromiseEscape(() => {
        nextDeferred()
    })
}

export { isTimeToYield }
