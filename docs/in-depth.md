# `main-thread-scheduling` in-depth

This library is the culmination of a lot of research and hard work.

## How it works

### `isTimeToYield(priority: 'background' | 'user-visible')`

This function determines if the currently executing task still has time to do more work or is it time to give back control to the browser so it can render the next frame. Here are the things that happen inside the method:
- 

### `yieldToMainThread(priority: 'background' | 'user-visible')`

## Motivation



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