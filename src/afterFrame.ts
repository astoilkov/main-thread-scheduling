import queueTask from './queueTask'

// inspired by: https://github.com/andrewiggins/afterframe
export default function afterFrame(callback: () => void): void {
    requestAnimationFrame(() => {
        queueTask(callback)
    })
}
