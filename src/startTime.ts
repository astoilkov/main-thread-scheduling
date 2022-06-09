let startTime: number | undefined

export function updateStartTime(): void {
    startTime = Date.now()
}

export function getStartTime(): number {
    return startTime ?? 0
}
