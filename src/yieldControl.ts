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
    if (priority === 'user-visible') {
        await promiseSequantial([
            (): Promise<void> => waitCallback(requestLaterMicrotask),
            (): Promise<void> =>
                waitCallback(requestIdleCallback, {
                    // #WET 2021-06-05T3:07:18+03:00
                    // #connection 2021-06-05T3:07:18+03:00
                    // call at least once per frame
                    // asuming 60 fps, 1000/60 = 16.667
                    timeout: 16,
                }),
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
