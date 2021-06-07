<br>
<br>
<div align="center">
<img width="288px" src="media/logo-centered.png">
</div>

<h3 align="center">
<b>main-thread-scheduling</b>
</h3>
<p align="center">
Consistently responsive apps while staying on the main thread
</p>

<p align="center">
<a href="https://www.travis-ci.com/astoilkov/main-thread-scheduling">
<img src="https://www.travis-ci.com/astoilkov/main-thread-scheduling.svg?branch=master" alt="Build Status" />
</a>
<a href="https://codeclimate.com/github/astoilkov/main-thread-scheduling/test_coverage">
<img src="https://img.shields.io/codeclimate/coverage/astoilkov/main-thread-scheduling" alt="Test Coverage" />
</a>
<a href="https://bundlephobia.com/result?p=use-local-storage-state">
<img src="https://badgen.net/bundlephobia/min/main-thread-scheduling" alt="Test Coverage" />
</a>
<!-- [![Minified Size](https://img.shields.io/npm/dm/main-thread-scheduling)](https://www.npmjs.com/package/use-local-storage-state) -->
<p>

<br>

## Install

```shell
npm install main-thread-scheduling
```

## Overview

The library ensures that:
- the UI never freezes
- the user's computer fans don't spin
- it can be easily integrated in an existing code base

This is accomplished through multiple strategies:
- Stops task execution when user interacts with the UI. Using `navigator.scheduling.isInputPending()`. Fallbacks to using [IdleDeadline](https://developer.mozilla.org/en-US/docs/Web/API/IdleDeadline)
- Global tasks queue. Multiple tasks are executed one by one so increasing the number of tasks doesn't degrade performance linearly.
- Sorts tasks by importance. Sorts by [priority](#priorities) and gives priority to tasks requested later.
- Urgent UI changes are given highest priority possible. Tasks with `user-visible` priority are optimized to deliver smooth UX by updating 
- Considerate about your existing code. Tasks with `background` priority are executed last so there isn't some unexpected work that slows down the main thread after the background task is finished.

## Use Cases

- You want to turn a synchronous function into a non-blocking asynchronous function. Avoids UI freezes.
- You want to yield important results first and less urgent ones second. Improves perceived performance.
- You want to run a background task that doesn't spin the fans. Avoids bad reputation.
- You want to run multiple backgrounds tasks that don't pile up with time. Prevents death by a thousand cuts.

## Why

Why rely on some open-source library to ensure a good performance for my app?
- Simple. 90% of the time you only need `yieldOrContinue(priority)` function. The API has two more functions for more advanced cases.
- Not a weekend project. I have been working on this code for months. If you want to dive deeper, you can read the [in-depth](./docs/in-depth.md) doc.
- This is the future. Browsers are probably going to support scheduling tasks on the main thread in the future. Here is the [spec](https://github.com/WICG/scheduling-apis).
- Aiming for high-quality with [my open-source principles](https://astoilkov.com/my-open-source-principles)

## API

Note: If you want to understand how this library works under the hook and some of the details – read the [in-depth](./docs/in-depth.md) doc.

### `yieldOrContinue(priority: 'background' | 'user-visible')`

The complexity of the entire library is hidden behind this method. You can have great app performance by calling a single method.

```ts
async function findInFiles(query: string) {  
    for (const file of files) {
        await yieldOrContinue('user-visible')
        
        for (const line of file.lines) {
            fuzzySearchLine(line, query)
        }
    }
}
```

### More complex scenarios

The library has two more functions available: `yieldToMainThread(priority: 'background' | 'user-visible')` and `isTimeToYield(priority: 'background' | 'user-visible')`. These two functions are used together to handle more advanced use cases.

A simple use case where you will need those two functions is when you want to render your view before yielding back control to the browser to continue its work:
```ts
async function doHeavyWork() {
    for (const value of values) {
        if (isTimeToYield('user-visible')) {
            render()
            await yieldToMainThread('user-visible')
        }
        
        computeHeavyWorkOnValue(value)
    }
}
```

### Priorities

Currently there are only two priorities available: `background` and `user-visible`:
- `background` – use this for background tasks. Every background task is run for 5ms.
- `user-visible` – use this for things that need to display to the user as fast as possible. Every `user-visible` task is run for 50ms – this gives you a nice cycle of doing heavy work and letting the browser render pending changes.

If you have a use case for a third priority, you can write in [this issue](https://github.com/astoilkov/main-thread-scheduling/issues/1).

## Alternatives

- Web Workers

The problem this library solves isn't new. However, I haven't found a library that can solve this problem in a simple manner. [Open an issue](https://github.com/astoilkov/main-thread-scheduling/issues/new) if there is such a library so I can add it here.

React has an implementation for scheduling tasks – [react/scheduler](https://github.com/facebook/react/tree/3c7d52c3d6d316d09d5c2479c6851acecccc6325/packages/scheduler). They plan to make it more generic but I don't know their timeline.