import yieldControl from './yieldControl'
import isTimeToYield from './isTimeToYield'

// disabling ESLint otherwise `requestPromiseEscape()` in `yieldControl()` won't work
// eslint-disable-next-line @typescript-eslint/promise-function-async
export default function yieldOrContinue(priority: 'user-visible' | 'background'): Promise<void> {
    // - in Node.js context return immediately
    // - this way we also support test environments (without jsdom added)
    // - support for scheduling in Node.js is still under consideration for future versions
    if (typeof requestAnimationFrame === 'undefined') {
        return Promise.resolve()
    }

    if (isTimeToYield(priority)) {
        return yieldControl(priority)
    }

    return Promise.resolve()
}
