import { nextDeferred } from './src/deferred'
import isTimeToYield from './src/isTimeToYield'
import yieldToMainThreadBase from './src/yieldToMainThread'
import { cancelPromiseEscape, requestPromiseEscape } from './src/promiseEscape'

let promiseEscapeId: number | undefined

export async function yieldOrContinue(priority: 'background' | 'user-visible'): Promise<void> {
    cancelPromiseEscape(promiseEscapeId)

    if (isTimeToYield(priority)) {
        await yieldToMainThreadBase(priority)
    }

    cancelPromiseEscape(promiseEscapeId)

    promiseEscapeId = requestPromiseEscape(() => {
        nextDeferred()
    })
}

export async function yieldToMainThread(priority: 'background' | 'user-visible'): Promise<void> {
    cancelPromiseEscape(promiseEscapeId)

    await yieldToMainThreadBase(priority)

    cancelPromiseEscape(promiseEscapeId)

    promiseEscapeId = requestPromiseEscape(() => {
        nextDeferred()
    })
}

export { isTimeToYield }
