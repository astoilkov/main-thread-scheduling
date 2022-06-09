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
                lastAnimationFrameTime = undefined
            } else {
                requestAnimationFrame(loop)
                lastAnimationFrameTime = Date.now()
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
