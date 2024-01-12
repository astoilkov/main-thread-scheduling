export interface PromiseWithResolvers<T = void> {
    promise: Promise<T>
    resolve: (value: T) => void
    reject: (reason?: any) => void
}

export default function withResolvers<T = void>(): PromiseWithResolvers<T> {
    let resolve: (value: T) => void
    let reject: () => void

    const promise = new Promise<T>((res, rej) => {
        resolve = res
        reject = rej
    })

    return {
        promise,
        resolve: resolve!,
        reject: reject!,
    }
}
