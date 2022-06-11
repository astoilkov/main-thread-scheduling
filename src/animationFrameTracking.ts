let startTimeFallback: number | undefined
let lastAnimationFrameTime: number | undefined
let status: 'looping' | 'stopped' | 'stopping' = 'stopped'

export function startTrackingAnimationFrames(): void {
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
            if (status === 'stopping') {
                status = 'stopped'
                startTimeFallback = undefined
                lastAnimationFrameTime = undefined
            } else {
                requestAnimationFrame(loop)
                lastAnimationFrameTime = performance.now()
            }
        })
    }

    loop()
}

export function stopTrackingAnimationFrames(): void {
    status = 'stopping'
}

export function getLastAnimationFrameTime(): number | undefined {
    return lastAnimationFrameTime
}

export function notifyFirstScheduleComplete(): void {
    if (startTimeFallback === undefined) {
        startTimeFallback = performance.now()
    }
}

export function getStartTimeFallback(): number | undefined {
    return startTimeFallback
}
