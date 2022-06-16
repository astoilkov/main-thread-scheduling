import isTimeToYield from './isTimeToYield'
import yieldControl from './yieldControl'

// disabling ESLint otherwise `requestPromiseEscape()` in `yieldControl()` won't work
// eslint-disable-next-line @typescript-eslint/promise-function-async
export default function yieldOrContinue(priority: 'user-visible' | 'background'): Promise<void> {
    if (isTimeToYield(priority)) {
        return yieldControl(priority)
    }

    return Promise.resolve()
}
