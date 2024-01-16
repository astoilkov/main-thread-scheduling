import { isTimeToYield, SchedulingPriority, yieldOrContinue } from '../index'

document.querySelector('#run-user-visible')!.addEventListener('click', () => {
    run('user-visible')
})
document.querySelector('#run-user-blocking')!.addEventListener('click', () => {
    run('user-blocking')
})
document.querySelector('#run-background')!.addEventListener('click', () => {
    run('background')
})
document.querySelector('#run-all')!.addEventListener('click', async () => {
    await run('user-blocking')
    await run('user-visible')
    await run('background')
})

async function run(priority: SchedulingPriority) {
    const start = Date.now()
    while (Date.now() - start < 1000) {
        if (isTimeToYield(priority)) {
            await yieldOrContinue(priority)
        }
    }
}
