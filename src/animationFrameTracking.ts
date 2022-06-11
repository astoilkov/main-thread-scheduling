let trackingStartTime: number | undefined
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

    trackingStartTime = performance.now()

    const loop = (): void => {
        requestAnimationFrame(() => {
            if (status === 'stopping') {
                status = 'stopped'
                trackingStartTime = undefined
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

export function getTrackingStartTime(): number | undefined {
    return trackingStartTime
}
