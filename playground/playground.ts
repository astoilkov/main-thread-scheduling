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

document.querySelector('#post-task-blocking')!.addEventListener('click', () => {
    runPostTask('user-blocking')
})
document.querySelector('#post-task-visible')!.addEventListener('click', () => {
    runPostTask('user-visible')
})
document.querySelector('#post-task-background')!.addEventListener('click', () => {
    runPostTask('background')
})

async function runPostTask(priority: SchedulingPriority) {
    for (let i = 0; i < 5; i++) {
        scheduler.postTask(
            () => {
                const start = Date.now()
                while (Date.now() - start < 200) {}
            },
            {
                priority,
            },
        )
    }
}
