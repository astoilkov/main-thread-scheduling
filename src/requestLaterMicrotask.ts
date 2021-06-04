export default function requestLaterMicrotask(callback: () => void): void {
    // - we call `queueMicrotask()` twice in order to try to be the last one calling
    //   `requestIdleCallback()`
    // - we don't use `setTimeout()` because calling `requestIdleCallback()` from there
    //   registers it for the next iteration of the main event loop not for the current one
    queueMicrotask(() => {
        queueMicrotask(() => {
            callback()
        })
    })
}
