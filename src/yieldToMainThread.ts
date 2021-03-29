import isTimeToYield from './isTimeToYield'
import requestLastIdleCallback from './requstLastIdleCallback'
import { createDeferred, isDeferredLast, removeDeferred } from './deferred'

export default async function yieldToMainThread(
    priority: 'user-visible' | 'background',
): Promise<void> {
    const deferred = createDeferred(priority)

    await requestLastIdleCallback()

    if (!isDeferredLast(deferred)) {
        await deferred.ready

        if (!isTimeToYield(priority)) {
            await requestLastIdleCallback()
        }
    }

    removeDeferred(deferred)
}
