const callbacks: (() => void)[] = []

export default function nextTask(callback: () => void): void {
    if (callbacks.length === 0) {
        const channel = new MessageChannel()
        channel.port2.postMessage(undefined)
        // eslint-disable-next-line unicorn/prefer-add-event-listener
        channel.port1.onmessage = (): void => {
            const callbacksCopy = [...callbacks]

            callbacks.splice(0, callbacks.length)

            for (const callback of callbacksCopy) {
                callback()
            }
        }
    }

    callbacks.push(callback)
}
