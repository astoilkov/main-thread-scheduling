import { startTracking, stopTracking } from './tracking'

type Deferred = {
    priority: 'background' | 'user-visible'
    ready: Promise<void>
    resolve: () => void
}

const deferred: Deferred[] = []

/**
 * Adds a task to the queue and returns the new task.
 * @param priority {('background' | 'user-visible')} The priority of the new task.
 */
export function createDeferred(priority: 'background' | 'user-visible'): Deferred {
    const wr = whenReady()
    const item = { priority, ready: wr.promise, resolve: wr.resolve }
    const insertIndex =
        priority === 'user-visible'
            ? deferred.length
            : deferred.findIndex((deferred) => deferred.priority === 'user-visible')
    deferred.splice(insertIndex === -1 ? deferred.length : insertIndex, 0, item)

    if (deferred.length === 1) {
        startTracking()
    }

    return item
}

/**
 * Checks if the task is last in the queue and it's time to run it.
 * @param deferredItem {Deferred}
 */
export function isDeferredLast(deferredItem: Deferred): boolean {
    return deferredItem === deferred[deferred.length - 1]
}

/**
 * Remove the task from the queue. This happens when we execute this task and it's time for the next
 * one. Call `nextDeferred()` in order to start executing the next task.
 * @param deferredItem {Deferred}
 */
export function removeDeferred(deferredItem: Deferred): void {
    const index = deferred.indexOf(deferredItem)

    // istanbul ignore if
    if (index === -1) {
        // silentError()
    } else {
        deferred.splice(index, 1)
    }

    if (deferred.length === 0) {
        stopTracking()
    }
}

/**
 * Resolve the last task in the queue. This triggers executing the task by resolving the promise
 * inside `yieldControl()` function.
 */
export function nextDeferred(): void {
    const lastDeferredItem = deferred[deferred.length - 1]
    if (lastDeferredItem !== undefined) {
        lastDeferredItem.resolve()
    }
}

type WhenReady<T> = {
    promise: Promise<T>
    resolve: (value: T) => void
}
/**
 * A simple abstraction that allows to resolve a promise outside of its constructor.
 */
function whenReady(): WhenReady<void>
function whenReady<T>(): WhenReady<T>
function whenReady<T>(): WhenReady<T> {
    let promiseResolve: (value: T) => void

    const promise = new Promise<T>((resolve) => (promiseResolve = resolve))

    return {
        promise,
        resolve: promiseResolve!,
    }
}
