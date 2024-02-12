import withResolvers from './withResolvers'

const state = {
    scheduled: false,
    nextTask: withResolvers(),
}

// same as queueMicrotask() but for tasks
// https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide#tasks_vs._microtasks
// https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide/In_depth#tasks_vs._microtasks
export default function waitNextTask(): Promise<void> {
    if (!state.scheduled) {
        state.scheduled = true
        state.nextTask = withResolvers()
        nextTask(() => {
            state.scheduled = false
            state.nextTask.resolve()
        })
    }

    return state.nextTask.promise
}

function nextTask(callback: () => void): void {
    const channel = new MessageChannel()
    channel.port2.postMessage(undefined)
    channel.port1.onmessage = callback
}
