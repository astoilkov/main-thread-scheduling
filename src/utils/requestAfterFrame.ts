import queueTask from './queueTask'

/**
 * Calls the callback after the browser renders the next frame.
 * Compared to requestAnimationFrame() that calls the callback before the next frame.
 * Inspired by: https://github.com/andrewiggins/afterframe
 * @param callback
 */
export default function requestAfterFrame(callback: () => void): void {
    requestAnimationFrame(() => {
        queueTask(callback)
    })
}
