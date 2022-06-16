import isTimeToYield from './isTimeToYield'
import yieldControl from './yieldControl'

export default function yieldOrContinue(priority: 'user-visible' | 'background'): Promise<void> {
    if (isTimeToYield(priority)) {
        return yieldControl(priority)
    }

    return Promise.resolve()
}
