import whenReady, { WhenReady } from './whenReady'

let wr: WhenReady<IdleDeadline> | undefined

/**
 * Request the next time the browser is idle while trying to call it at late as possible. We want to
 * call it at late as possible because there could another task that will take a few more
 * milliseconds after we finish the task – this can cause a moment of unreponsiveness.
 *
 * Note: if `requestIdleCallback()` is called inside of a `requestIdleCallback()` it is postponed
 * for the next iteration of the browser event loop.
 */
export default async function requestLastIdleCallback(): Promise<IdleDeadline> {
    if (wr === undefined) {
        wr = whenReady<IdleDeadline>()

        // - we call `queueMicrotask()` twice in order to try to be the last one calling
        //   `requestIdleCallback()`
        // - we don't use `setTimeout()` because calling `requestIdleCallback()` from there
        //   registers it for the next iteration of the main event loop not for the current one
        queueMicrotask(() => {
            queueMicrotask(() => {
                requestIdleCallback((deadline) => {
                    wr?.resolve(deadline)

                    wr = undefined
                })
            })
        })
    }

    return wr.promise
}
