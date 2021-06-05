import waitCallback from './waitCallback'
import isTimeToYield from './isTimeToYield'
import requestLaterMicrotask from './requestLaterMicrotask'
import { createDeferred, isDeferredLast, removeDeferred } from './deferred'

export default async function yieldToMainThread(
    priority: 'user-visible' | 'background',
): Promise<void> {
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
    if (priority === 'user-visible') {
        await Promise.race([
            promiseSequantial([
                (): Promise<void> => waitCallback(requestLaterMicrotask),
                (): Promise<void> =>
                    waitCallback(requestIdleCallback, {
                        // #connection 2021-06-05T3:07:18+03:00
                        // 60 frames per second
                        timeout: 1000 / 60,
                    }),
            ]),
        ])
    } else {
        await promiseSequantial([
            (): Promise<void> => waitCallback(requestLaterMicrotask),
            (): Promise<void> => waitCallback(requestIdleCallback),
        ])
    }
}

async function promiseSequantial(getPromises: (() => Promise<unknown>)[]): Promise<void> {
    for (const getPromise of getPromises) {
        await getPromise()
    }
}
