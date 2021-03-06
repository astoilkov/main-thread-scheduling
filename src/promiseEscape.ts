let globalId = 0

const running = new Set<number>()

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

export function cancelPromiseEscape(id: number | undefined): void {
    if (id !== undefined) {
        running.delete(id)
    }
}
