import { isTimeToYield, SchedulingPriority, yieldOrContinue } from '../index'

document.querySelector('#run-user-visible')!.addEventListener('click', () => {
    run('smooth')
})
document.querySelector('#run-user-blocking')!.addEventListener('click', () => {
    run('interactive')
})
document.querySelector('#run-background')!.addEventListener('click', () => {
    run('idle')
})
document.querySelector('#run-all')!.addEventListener('click', async () => {
    await run('interactive')
    await run('smooth')
    await run('idle')
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
    runPostTask('interactive')
})
document.querySelector('#post-task-visible')!.addEventListener('click', () => {
    runPostTask('smooth')
})
document.querySelector('#post-task-background')!.addEventListener('click', () => {
    runPostTask('idle')
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
