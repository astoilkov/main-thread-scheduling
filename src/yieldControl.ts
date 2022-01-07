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

        await waitCallback(nextTask)
    } else if (priority === 'user-visible') {
        await waitCallback(requestLaterMicrotask)

        await waitCallback(requestIdleCallback, {
            // #WET 2021-06-05T3:07:18+03:00
            // #connection 2021-06-05T3:07:18+03:00
            // call at least once per frame
            // assuming 60 fps, 1000/60 = 16.667
            timeout: 16,
        })
    } else {
        await waitCallback(requestLaterMicrotask)

        await waitCallback(requestIdleCallback)
    }
}
