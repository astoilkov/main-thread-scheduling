export default interface SchedulingTask {
    type: 'frame-based' | 'idle-based'
    workTime: number
    priority: number
}
