import waitCallback from './waitCallback'
import isTimeToYield from './isTimeToYield'
import requestLaterMicrotask from './requestLaterMicrotask'
import { createDeferred, isDeferredLast, removeDeferred } from './deferred'
import requestEarlyIdleCallback from './requestEarlyIdleCallback'

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
                (): Promise<void> => waitCallback(requestEarlyIdleCallback),
            ]),

            promiseSequantial([
                (): Promise<void> => waitCallback(requestLaterMicrotask),
                (): Promise<void> => waitCallback(requestIdleCallback),
            ]),

            // promiseSequantial([
            //     (): Promise<void> => waitCallback(requestLaterMicrotask),
            //     (): Promise<void> => waitCallback(requestIdleCallback),
            // ]),
            //
            // // not optimal when you are already in requestAnimationFrame(). this is why we have the
            // // above promise
            // promiseSequantial([
            //     (): Promise<void> => waitCallback(requestLaterMicrotask),
            //     (): Promise<void> => waitCallback(requestAnimationFrame),
            //     (): Promise<void> => waitCallback(requestIdleCallback, { timeout: 1 }),
            // ]),
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
