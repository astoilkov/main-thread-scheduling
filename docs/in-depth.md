# `main-thread-scheduling` in-depth

This library is the culmination of a lot of research and hard work.

## `isTimeToYield(priority: 'background' | 'user-visible')`

This function determines if the currently executing task still has time to do more work or is it time to give back control to the browser so it can render the next frame. This is how it works:
1. When the queue of tasks isn't empty there is a continuously running `requestIdleCallback()` that tracks time it was last executed. This help us figure out if there is time left to do more work.
2. The method takes the time the last call to `requestIdleCallback()` was called and determines if there is time to do more work. This behavior is different depending if the `navigator.scheduling.isInputPending()` method is available in the current browser.
    - If `isInputPending()` is available, the function waits for either `isInputPending()` to return `true` or for the max allowed time for the task to expire. The max allowed time for the task depends on the `priority`.

## `yieldToMainThread(priority: 'background' | 'user-visible')`

## Priorities

There is currently only two priorities available: `background` and `user-visible`. The priority determine two things: 1) the maximum amount of time the task can run without yielding to the main thread, 2) in what order the task is executed.

The maximum amount of time allowed by priority:
- `background` – 5ms
- `user-visible` – 50ms

`user-visible` priority will be executed first. `background` second. Read more about this in the next section.

## Execution order

Execution order is more easily explained with a code example:
```ts
(async () => {
    await yieldToMainThread('user-visible')
    console.log('2')
})()

(async () => {
    await yieldToMainThread('user-visible')
    console.log('1')
})()

(async () => {
    await yieldToMainThread('background')
    console.log('3')
})()
```

## Resources

Documents associated with implementing scheduling in browsers:
- [WICG/main-thread-scheduling](https://github.com/WICG/main-thread-scheduling) and more specifically [Main Thread Scheduling: Prioritized postTask API](https://github.com/WICG/main-thread-scheduling/blob/646edfc3d735333162fb7a447c845b49b6a11d66/PrioritizedPostTask.md)
- [Native Web Scheduling MVP: API Proposal](https://docs.google.com/document/d/1xU7HyNsEsbXhTgt0ZnXDbeSXm5-m5FzkLJAT6LTizEI/edit#)
- [Threading and Tasks in Chrome](https://chromium.googlesource.com/chromium/src/+/refs/tags/62.0.3175.0/docs/threading_and_tasks.md#Posting-a-Parallel-Task)
- [Signal-Based postTask Design](https://docs.google.com/document/d/1Apz-SD-pOagGeyWxIpgOi0ARNkrCrELhPdm18eeu9tw/edit)

Articles that talk about scheduling tasks in the browser:
- [The hidden magic of Main Thread Scheduling](https://medium.com/nmc-techblog/the-hidden-magic-of-main-thread-scheduling-5f20b7803293)
- [Sneak Peek: Beyond React 16 – React Blog](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html)
- [Scheduling in React](https://philippspiess.com/scheduling-in-react/)

In depth look of some concepts talked in the document:
- [`queueMicrotask()`](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide)
- [The `requestAnimationFrame()` guide](https://flaviocopes.com/requestanimationframe/)
- [JavaScript Event Loop vs Node JS Event Loop](https://blog.insiderattack.net/javascript-event-loop-vs-node-js-event-loop-aea2b1b85f5c)
- [Using `requestIdleCallback()`](https://developers.google.com/web/updates/2015/08/using-requestidlecallback)