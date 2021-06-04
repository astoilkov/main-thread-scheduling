let waitAnimationFrame = false

export default function requestEarlyIdleCallback(callback: (deadline: IdleDeadline) => void): void {
    if (waitAnimationFrame) {
        requestAnimationFrame(() => {
            waitAnimationFrame = false

            request(callback)
        })
    } else {
        request(callback)
    }
}

function request(callback: (deadline: IdleDeadline) => void): void {
    requestIdleCallback(
        (deadline) => {
            waitAnimationFrame = true

            callback(deadline)
        },
        { timeout: 1 },
    )
}
