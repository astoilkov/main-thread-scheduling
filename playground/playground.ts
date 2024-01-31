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
    run('interactive')
    run('smooth')
    run('idle')
})

async function run(strategy: SchedulingStrategy) {
    const start = Date.now()
    while (Date.now() - start < 1000) {
        if (isTimeToYield(strategy)) {
            await yieldOrContinue(strategy)
        }
    }
    performance.measure(strategy, {
        start: start,
        end: Date.now(),
        detail: 'awesome',
    })
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
