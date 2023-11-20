import yieldControl from './yieldControl'
import isTimeToYield from './isTimeToYield'
import SchedulingPriority from './SchedulingPriority'

// disabling ESLint otherwise `requestPromiseEscape()` in `yieldControl()` won't work
// eslint-disable-next-line @typescript-eslint/promise-function-async
export default function yieldOrContinue(priority: SchedulingPriority): Promise<void> {
    if (isTimeToYield(priority)) {
        return yieldControl(priority)
    }

    return Promise.resolve()
}
