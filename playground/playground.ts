import { isTimeToYield, SchedulingStrategy, yieldOrContinue } from '../index'

document.querySelector('#run-smooth')!.addEventListener('click', () => {
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

async function run(priority: SchedulingStrategy) {
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

async function runPostTask(priority: 'user-blocking' | 'user-visible' | 'background') {
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
