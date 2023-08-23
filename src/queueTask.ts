const callbacks: (() => void)[] = []

// same as queueMicrotask() but for tasks
// https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide#tasks_vs._microtasks
// https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide/In_depth#tasks_vs._microtasks
export default function queueTask(callback: () => void): void {
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
