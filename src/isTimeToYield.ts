// scenario 1:
// - `requestIdleCallback()` callback is called
// - `const timeRemaining = await nextIdleCallback()` will resolve in the next microtask
// - `pop()` will be called inside `nextIteration()`
// - `pop()` will resolve `waitToBeLastInQueue()` inside `nextIteration()` in next microtask
// - `return await nextIdleCallback()` will be called
// scenario 2:
// - (what happens with no tasks remaining)

type IdlePhase = {
    start: number
    deadline: IdleDeadline
}

let idlePhase: IdlePhase | undefined
let earlyIdleCallbackId: number | undefined

export default function isTimeToYield(priority: 'background' | 'user-visible'): boolean {
    if (idlePhase !== undefined && performance.now() < calculateDeadline(priority, idlePhase)) {
        return false
    } else if (earlyIdleCallbackId === undefined) {
        earlyIdleCallbackId = requestIdleCallback((idleDeadline) => {
            earlyIdleCallbackId = undefined
            idlePhase = {
                deadline: idleDeadline,
                start: performance.now(),
            }
        })
    }

    return true
}

function calculateDeadline(priority: 'background' | 'user-visible', idlePhase: IdlePhase): number {
    const maxTime = priority === 'background' ? 5 : 50
    return navigator.scheduling?.isInputPending === undefined
        ? idlePhase.start + Math.min(idlePhase.deadline.timeRemaining(), maxTime)
        : idlePhase.start + maxTime
}
