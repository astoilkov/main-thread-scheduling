import requestLaterMicrotask from './requestLaterMicrotask'

let waitAnimationFrame = 0
let callbacks: ((deadline: IdleDeadline) => void)[] = []

export default function requestEarlyIdleCallback(callback: (deadline: IdleDeadline) => void): void {
    if (waitAnimationFrame > 0) {
        requestAnimationFrame(() => {
            request(callback)
        })
    } else {
        request(callback)
    }
}

function request(callback: (deadline: IdleDeadline) => void): void {
    waitAnimationFrame += 1

    if (callbacks.length === 0) {
        requestIdleCallback(
            (deadline) => {
                const pendingCallbacks = [...callbacks]

                callbacks = []

                for (const pendingCallback of pendingCallbacks) {
                    // if (navigator?.scheduling?.isInputPending?.() === true) {
                    //     callbacks.unshift(pendingCallback)
                    // } else {
                    //     pendingCallback(deadline)
                    // }
                    pendingCallback(deadline)
                }

                requestLaterMicrotask(() => {
                    waitAnimationFrame -= 1
                })
            },
            { timeout: 1 },
        )
    }

    callbacks.push(callback)
}
