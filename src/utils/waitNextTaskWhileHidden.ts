import waitNextTask from './waitNextTask'
import withResolvers from './withResolvers'

const state = {
    scheduled: false,
    hiddenTask: withResolvers(),
}

export default async function waitNextTaskWhileHidden(): Promise<void> {
    if (document.visibilityState === 'hidden') {
        await waitNextTask()

        // in theory, here the page could have been hidden again,
        // but we ignore this case on purpose
    } else {
        if (!state.scheduled) {
            state.scheduled = true
            state.hiddenTask = withResolvers()
            onVisibilityChange(() => {
                // events, are already in a new task, so we don't need to call `waitNextTask()`
                state.scheduled = false
                state.hiddenTask.resolve()
            })
        }

        return state.hiddenTask.promise
    }
}

function onVisibilityChange(callback: () => void): void {
    document.addEventListener('visibilitychange', callback, { once: true })
}
