import whenReady, { WhenReady } from './whenReady'

let wr: WhenReady<IdleDeadline> | undefined

// - if requestIdleCallback() is called inside of a `requestIdleCallback()` it is postponed for the
//   next iteration of the browser event loop
export default async function requestLastIdleCallback(): Promise<IdleDeadline> {
    if (wr === undefined) {
        wr = whenReady<IdleDeadline>()

        // try to wait for the last possible moment to run the next task because:
        // - we don't want to run a heavy task when there is a frame pending
        // - we use `requestIdleCallback()` because it runs last in the browser main event loop
        // - we use `queueMicrotask()` in order to try and put the `requestIdleCallback()` to be the last
        //   called idle callback
        // - we don't use `setTimeout()` because calling `requestIdleCallback()` from there registers it
        //   for the next iteration of the main event loop not for the current one
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
