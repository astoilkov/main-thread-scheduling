// inspired by Deno's implementation: https://deno.land/std@0.170.0/async/deferred.ts?source

/**
 * Creates a Promise with additional `reject` and `resolve` methods.
 * It also adds a `state` property.
 *
 * @example
 * ```typescript
 * const deferred = new Deferred<number>();
 * // ...
 * deferred.resolve(42);
 * ```
 */
export default class Deferred<T = void> extends Promise<T> {
    #resolve: (value: T | PromiseLike<T>) => void
    #reject: (reason?: unknown) => void
    #state: 'pending' | 'fulfilled' | 'rejected'

    constructor(
        executor?: (
            resolve: (value: T | PromiseLike<T>) => void,
            reject: (reason?: unknown) => void,
        ) => void,
    ) {
        let resolve: (value: T | PromiseLike<T>) => void
        let reject: (reason?: unknown) => void

        super((resolveLocal, rejectLocal) => {
            executor?.(resolveLocal, rejectLocal)

            resolve = resolveLocal
            reject = rejectLocal
        })

        this.#state = 'pending'
        this.#resolve = resolve!
        this.#reject = reject!
    }

    get state(): 'pending' | 'fulfilled' | 'rejected' {
        return this.#state
    }

    resolve(value: T): void
    resolve(value: PromiseLike<T>): Promise<void>
    resolve(value: T | PromiseLike<T>): void | Promise<void> {
        if (value instanceof Promise) {
            // eslint-disable-next-line promise/prefer-await-to-then
            return value.then(() => {
                this.#state = 'fulfilled'

                this.#resolve(value as T)
            })
        }

        this.#state = 'fulfilled'

        this.#resolve(value)
    }

    reject(reason?: unknown): void {
        this.#state = 'rejected'

        this.#reject(reason)
    }
}
