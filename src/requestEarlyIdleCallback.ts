import requestLaterMicrotask from './requestLaterMicrotask'

let waitAnimationFrame = 0
let callbacks: ((deadline: IdleDeadline) => void)[] = []

export default function requestEarlyIdleCallback(callback: (deadline: IdleDeadline) => void): void {
    const stack = new Error('measure').stack

    if (waitAnimationFrame > 0) {
        requestAnimationFrame(() => {
            wait(stack)

            request(stack, callback)
        })
    } else {
        request(stack, callback)
    }
}

function request(stack: string | undefined, callback: (deadline: IdleDeadline) => void): void {
    waitAnimationFrame += 1

    if (callbacks.length === 0) {
        requestIdleCallback(
            (deadline) => {
                const pendingCallbacks = [...callbacks]

                callbacks = []

                wait(stack)

                for (const pendingCallback of pendingCallbacks) {
                    if (navigator?.scheduling?.isInputPending?.() === true) {
                        callbacks.unshift(pendingCallback)
                    } else {
                        pendingCallback(deadline)
                    }
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

// you are in requestIdleCallback from a background task
// you are in requestIdleCallback not scheduled by this library

// - calling requestEarlyIdleCallback pospones the second call for the next requestAnimationFrame
//   - not sure if this is aproblem
// - calling requestEarlyIdleCallback in

function wait(stack: string | undefined): void {
    performance.mark('start')

    const start = Date.now()
    while (Date.now() - start < 6) {
        //
    }

    performance.mark('end')

    performance.measure(stack ?? 'n/a', 'start', 'end')
}
