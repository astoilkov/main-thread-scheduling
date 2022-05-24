let animationFrameId: number | undefined
let lastAnimationFrameTime: number | undefined

export function startTrackingAnimationFrames(): void {
    if (animationFrameId === undefined) {
        const loop = (): void => {
            animationFrameId = requestAnimationFrame(() => {
                lastAnimationFrameTime = Date.now()
                animationFrameId = requestAnimationFrame(loop)
            })
        }
        loop()
    }
}

export function stopTrackingAnimationFrames(): void {
    cancelAnimationFrame(animationFrameId)

    animationFrameId = undefined
}

export function getLastAnimationFrameTime(): number | undefined {
    return lastAnimationFrameTime
}
