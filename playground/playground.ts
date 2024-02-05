import { isTimeToYield, SchedulingStrategy, yieldOrContinue } from '../index'

document.querySelector('#run-interactive')!.addEventListener('click', () => {
    run('interactive')
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
    run('interactive')
    run('smooth', 2000)
    run('idle', 3000)
})
document.querySelector('#simulate-work')!.addEventListener('click', async () => {
    simulateWork()
})

async function run(strategy: SchedulingStrategy, time: number = 1000) {
    const start = Date.now()
    while (Date.now() - start < time) {
        if (isTimeToYield(strategy)) {
            await yieldOrContinue(strategy)
        }
        simulateWork()
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
    const totalTime = 1000
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

function simulateWork(): void {
    // a 5x5 matrix
    const matrixA = [
        [1, 2, 3, 4, 5],
        [4, 5, 6, 7, 8],
        [7, 8, 9, 10, 11],
        [7, 8, 9, 10, 11],
        [7, 8, 9, 10, 11],
    ]
    const matrixB = [
        [1, 2, 3, 4, 5],
        [4, 5, 6, 7, 8],
        [7, 8, 9, 10, 11],
        [7, 8, 9, 10, 11],
        [7, 8, 9, 10, 11],
    ]
    for (let i = 0; i < 5000; i++) {
        matrixMultiplication(matrixA, matrixB)
    }
}

function matrixMultiplication(matrix1: number[][], matrix2: number[][]) {
    const result = []
    const rows1 = matrix1.length
    const cols1 = matrix1[0]!.length
    const cols2 = matrix2[0]!.length

    for (var i = 0; i < rows1; i++) {
        result[i] = []
        for (var j = 0; j < cols2; j++) {
            // @ts-ignore
            result[i][j] = 0
            for (var k = 0; k < cols1; k++) {
                // @ts-ignore
                result[i][j] += matrix1[i][k] * matrix2[k][j]
            }
        }
    }

    return result
}
