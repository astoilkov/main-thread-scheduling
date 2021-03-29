let globalId = 0

const running = new Set<number>()

/**
 * If called at the end of an async method, it will wait for the the async to get resolved in the
 * parent method that called it and will execute the provided callback in the next microtask.
 * @param callback {Function} The callback that will be executed.
 */
export function requestPromiseEscape(callback: () => void): number {
    const id = globalId

    running.add(id)

    queueMicrotask(() => {
        queueMicrotask(() => {
            if (running.has(id)) {
                callback()
                running.delete(id)
            }
        })
    })

    globalId += 1

    return id
}

/**
 * Cancels the request to escape promise.
 * @param id {number | undefined} The id returned by the `requestPromiseEscape()` call.
 */
export function cancelPromiseEscape(id: number | undefined): void {
    if (id !== undefined) {
        running.delete(id)
    }
}
