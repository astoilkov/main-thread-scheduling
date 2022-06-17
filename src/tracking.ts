let lastIdleDeadline: IdleDeadline | undefined
let perFrameScheduleStartTime: number | undefined
let status: 'looping' | 'stopped' | 'stopping' = 'stopped'

export function startTracking(): void {
    // istanbul ignore next
    if (status === 'looping') {
        // silentError()
        return
    }

    if (status === 'stopping') {
        status = 'looping'
        return
    }

    const loop = (): void => {
        requestAnimationFrame(() => {
            perFrameScheduleStartTime = undefined

            if (status === 'stopping') {
                status = 'stopped'
            } else {
                requestAnimationFrame(loop)
            }
        })
    }

    loop()
}

export function stopTracking(): void {
    status = 'stopping'
}

export function notifyScheduleComplete(): void {
    if (perFrameScheduleStartTime === undefined) {
        perFrameScheduleStartTime = Date.now()
    }
}

export function getPerFrameScheduleStartTime(): number | undefined {
    return perFrameScheduleStartTime
}

export function notifyIdleCallback(idleDeadline: IdleDeadline): void {
    lastIdleDeadline = idleDeadline
}

export function getLastIdleDeadline(): IdleDeadline | undefined {
    return lastIdleDeadline
}
