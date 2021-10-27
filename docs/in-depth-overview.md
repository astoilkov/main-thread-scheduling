# `main-thread-scheduling` In-Depth Overview

This library is the culmination of a lot of research and hard work. Git history shows just a fraction of the effort because the code was previously in another repository.

This document is an overview of the library implementation. If you are looking at the code while reading this code, it may be easier to understand.

## `yieldControl(priority: 'background' | 'user-visible')`

This is the most complicated method in the library. Here how it works:
1. A new task is added to the queue
2. We wait for the next browser idle callback (using `requestIdleCallback()`)
3. After the idle callback is resolved we have two options:
    - If the current task is at the top of the queue, we remove the task from the queue and give back control to the user.
    - If there is some other task that has priority than we wait until the current task is at the top of the queue. After it's at the top, we check if there is time to start executing this task: 1) if yes, give back control to the user, 2) if not, we wait for the next browser idle callback to be called.

## `isTimeToYield(priority: 'background' | 'user-visible')`

This function determines if the currently executing task still has time to do more work or is it time to give back control to the browser so it can render the next frame. This is how it works:
1. When the queue of tasks isn't empty there is a continuously running `requestIdleCallback()` and `requestAnimationFrame()` that tracks the last time each callback has executed (see `phaseTracking.ts`). This help us figure out if there is time left to do more work.
2. The method takes the time the last call to `requestIdleCallback()` was called and determines if there is time to do more work. This behavior is different depending on the availability of `navigator.scheduling.isInputPending()` method in the current browser.
    - If `isInputPending()` is available, the function waits for either `isInputPending()` to return `true` or for the max allowed time for the task to expire. The max allowed time for the task depends on the `priority`.
    - If `isInputPending()` isn't available, the functions uses the `IdleDeadline` object passed as parameter to the `requestIdleCallback()`. When `IdleDeadline.timeRemaining()` returns `0` the `isTimeToYield()` function will return `true`.

## Priorities

There is currently only two priorities available: `background` and `user-visible`. The priority determine two things: 1) the maximum amount of time the task can run without yielding to the main thread, 2) in what order the task is executed.

The maximum amount of time allowed by priority:
- `background` – 5ms
- `user-visible` – 83ms

`user-visible` priority will be executed first. `background` second. Read more about this in the next section.

## Execution order

Execution order is more easily explained with a code example. The example below will log the values in order `1, 2, 3`. This means that `user-visible` tasks have priority over `background` tasks and that a task that is called later has bigger priority than the earlier called task:
```ts
(async () => {
    await yieldControl('user-visible')
    console.log('2')
})()

(async () => {
    await yieldControl('user-visible')
    console.log('1')
})()

(async () => {
    await yieldControl('background')
    console.log('3')
})()
```

## Resources

Documents associated with implementing main thread scheduling in browsers:
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
