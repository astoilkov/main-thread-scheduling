export default function nextTask(callback: () => void): void {
    const channel = new MessageChannel()
    channel.port2.postMessage(undefined)
    // eslint-disable-next-line unicorn/prefer-add-event-listener
    channel.port1.onmessage = (): void => callback()
}
