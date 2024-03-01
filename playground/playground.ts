import { isTimeToYield, SchedulingStrategy, yieldOrContinue } from '../index'
import simulateWork from './utils/simulateWork'
import waitNextTask from '../src/utils/waitNextTask'
import withResolvers from '../src/utils/withResolvers'
import fps from './utils/fps'

document.querySelector('#run-interactive')!.addEventListener('click', () => {
    run('interactive')
})
document.querySelector('#run-interactive-5s')!.addEventListener('click', () => {
    run('interactive', 5000)
})
document.querySelector('#run-smooth')!.addEventListener('click', () => {
    run('smooth')
})
document.querySelector('#run-idle')!.addEventListener('click', () => {
    run('idle')
})
document.querySelector('#run-all-sequential')!.addEventListener('click', async () => {
    await run('interactive')
    await run('smooth')
    await run('idle')
})
document.querySelector('#run-all-parallel')!.addEventListener('click', async () => {
    const signal = AbortSignal.timeout(500)
    run('interactive', 1000, signal)
    run('smooth', 2000)
    run('idle', 3000)
})
document.querySelector('#simulate-work')!.addEventListener('click', async () => {
    simulateWork()
})
document.querySelector('#post-task-blocking')!.addEventListener('click', () => {
    runPostTask('user-blocking')
})
document.querySelector('#post-task-visible')!.addEventListener('click', () => {
    runPostTask('user-visible')
})
document.querySelector('#post-task-background')!.addEventListener('click', () => {
    runPostTask('background')
})
document.querySelector('#post-task-vs-yield-or-continue')!.addEventListener('click', () => {
    postTaskVsYieldOrContinue()
})
document.querySelector('#queue-task')!.addEventListener('click', () => {
    runWaitNextTask()
})

setInterval(() => {
    document.querySelector(
        '.fps',
    )!.textContent = `frameRate: ${fps.guessRefreshRate()}, fps: ${fps.fps()}`
}, 20)

async function run(strategy: SchedulingStrategy, time: number = 1000, signal?: AbortSignal) {
    const start = performance.now()
    while (performance.now() - start < time) {
        if (isTimeToYield(strategy)) {
            try {
                await yieldOrContinue(strategy, signal)
            } catch {
                break
            }
        }
        simulateWork()
    }
    const secs = ((performance.now() - start) / 1000).toFixed(2)
    const label = `${strategy} (${secs}s)`
    console.log(label)
    performance.measure(label, {
        start: start,
        end: performance.now(),
    })
}

async function runPostTask(priority: 'user-blocking' | 'user-visible' | 'background') {
    const totalTime = 5000
    const singleTaskTime = 2
    const iterations = Math.round(totalTime / singleTaskTime)
    for (let i = 0; i < iterations; i++) {
        // @ts-ignore
        scheduler.postTask(
            () => {
                const start = Date.now()
                while (Date.now() - start < singleTaskTime) {}
            },
            {
                priority,
            },
        )
    }
}

async function runWaitNextTask(time: number = 1000) {
    const start = Date.now()
    while (Date.now() - start < time) {
        await waitNextTask()
        simulateWork()
    }
}

async function postTaskVsYieldOrContinue() {
    {
        const start = performance.now()
        let count = 0
        while (performance.now() - start < 1000) {
            await waitPostTask()
            count++
        }
        console.log(count.toString(), '→ postTask()')
    }
    {
        const start = performance.now()
        let count = 0
        while (performance.now() - start < 1000) {
            await waitNextTask()
            count++
        }
        console.log(count.toString(), '→ waitNextTask()')
    }
    {
        const start = performance.now()
        let count = 0
        while (performance.now() - start < 1000) {
            await yieldOrContinue('smooth')
            count++
        }
        console.log(count.toString(), '→ yieldOrContinue()')
    }
}

async function waitPostTask(
    priority?: 'user-blocking' | 'user-visible' | 'background',
): Promise<void> {
    const { promise, resolve } = withResolvers()
    // @ts-ignore
    scheduler.postTask(
        () => {
            resolve()
        },
        { priority },
    )
    return promise
}
