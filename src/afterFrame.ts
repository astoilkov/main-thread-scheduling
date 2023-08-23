import queueTask from './queueTask'

export default function afterFrame(callback: () => void): void {
    requestAnimationFrame(() => {
        queueTask(callback)
    })
}
