export type WhenReady<T> = {
    promise: Promise<T>
    resolve: (value: T) => void
}
/**
 * A simple abstraction that allows to resolve a promise outside of its constructor.
 */
export default function whenReady(): WhenReady<void>
export default function whenReady<T>(): WhenReady<T>
export default function whenReady<T>(): WhenReady<T> {
    let promiseResolve: (value: T) => void

    const promise = new Promise<T>((resolve) => (promiseResolve = resolve))

    return {
        promise,
        resolve: promiseResolve!,
    }
}
