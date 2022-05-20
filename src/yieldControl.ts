import nextTask from './nextTask'
import waitCallback from './waitCallback'
import isTimeToYield from './isTimeToYield'
import requestLaterMicrotask from './requestLaterMicrotask'
import { createDeferred, isDeferredLast, removeDeferred } from './deferred'

export default async function yieldControl(priority: 'user-visible' | 'background'): Promise<void> {
    const deferred = createDeferred(priority)

    await schedule(priority)

    if (!isDeferredLast(deferred)) {
        await deferred.ready

        if (isTimeToYield(priority)) {
            await schedule(priority)
        }
    }

    removeDeferred(deferred)
}

async function schedule(priority: 'user-visible' | 'background'): Promise<void> {
    if (typeof requestIdleCallback === 'undefined') {
        await waitCallback(requestAnimationFrame)

        await waitCallback(requestLaterMicrotask)

        await waitCallback(nextTask)
    } else if (priority === 'user-visible') {
        await waitCallback(requestLaterMicrotask)

        await waitCallback(requestIdleCallback, {
            // #WET 2021-06-05T3:07:18+03:00
            // #connection 2021-06-05T3:07:18+03:00
            // - call at least once per frame
            // - assuming 60 fps, 1000/60 = 16.667 = 16.7
            // - the browser uses around 6ms. the user is left with 10ms:
            //   https://developer.mozilla.org/en-US/docs/Web/Performance/How_long_is_too_long#:~:text=The%2016.7%20milliseconds%20includes%20scripting%2C%20reflow%2C%20and%20repaint.%20Realize%20a%20document%20takes%20about%206ms%20to%20render%20a%20frame%2C%20leaving%20about%2010ms%20for%20the%20rest.
            // - because 9*2 is equal to 18, we are sure the idle callback won't be called more than
            //   once per frame
            timeout: 9,
        })
    } else {
        await waitCallback(requestLaterMicrotask)

        await waitCallback(requestIdleCallback)
    }
}
