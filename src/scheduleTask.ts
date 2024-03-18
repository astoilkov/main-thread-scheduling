import isTimeToYield from './isTimeToYield'
import yieldControl from './yieldControl'
import type SchedulingStrategy from './SchedulingStrategy'

export type ScheduleTaskOptions = {
    strategy?: SchedulingStrategy
    signal?: AbortSignal
}

export default async function scheduleTask<T>(
    callback: () => T,
    { strategy, signal }: ScheduleTaskOptions = {
        strategy: 'smooth',
    },
): Promise<T> {
    strategy = strategy ?? 'smooth'
    if (isTimeToYield(strategy)) {
        await yieldControl(strategy, signal)
    }

    const result = await callback()

    return result
}
