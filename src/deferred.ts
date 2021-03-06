import whenReady from './whenReady'

type Deferred = {
    priority: 'background' | 'user-visible'
    ready: Promise<void>
    resolve: () => void
}

const deferred: Deferred[] = []

export function createDeferred(priority: 'background' | 'user-visible'): Deferred {
    const wr = whenReady()
    const item = { priority, ready: wr.promise, resolve: wr.resolve }
    const insertIndex =
        priority === 'user-visible'
            ? deferred.length
            : deferred.findIndex((deferred) => deferred.priority === 'user-visible')
    deferred.splice(insertIndex === -1 ? deferred.length : insertIndex, 0, item)
    return item
}

export function isDeferredLast(deferredItem: Deferred): boolean {
    return deferredItem === deferred[deferred.length - 1]
}

export function removeDeferred(deferredItem: Deferred): void {
    const index = deferred.indexOf(deferredItem)
    if (index !== -1) {
        deferred.splice(index, 1)
    }
}

export function nextDeferred(): void {
    const lastDeferredItem = deferred[deferred.length - 1]
    if (lastDeferredItem !== undefined) {
        lastDeferredItem.resolve()
    }
}
