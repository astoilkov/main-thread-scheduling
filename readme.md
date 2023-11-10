<br>
<br>
<div align="center">
<img width="288px" src="media/logo-centered.png">
</div>

<h3 align="center">
<b>main-thread-scheduling</b>
</h3>
<p align="center">
Fast and consistently responsive apps using a single function call
</p>

<p align="center">
<a href="https://bundlephobia.com/result?p=main-thread-scheduling">
<img src="https://img.shields.io/bundlephobia/minzip/main-thread-scheduling" alt="Gzipped Size" />
</a>
<a href="https://codeclimate.com/github/astoilkov/main-thread-scheduling/test_coverage">
<img src="https://img.shields.io/codeclimate/coverage/astoilkov/main-thread-scheduling" alt="Test Coverage" />
</a>
<a href="https://github.com/astoilkov/main-thread-scheduling/actions/workflows/main.yml">
<img src="https://img.shields.io/github/actions/workflow/status/astoilkov/main-thread-scheduling/main.yml?branch=main" alt="Build Status" />
</a>
<p>

<br>

## Install

```bash
npm install main-thread-scheduling
```

## Overview

The library lets you run computationally heavy tasks on the main thread while ensuring:
- Your app's UI doesn't freeze.
- Your users' computer fans don't spin.
- It can be easily integrated into your existing codebase.

A real-world showcase of searching in 10k files and getting results instantly — https://twitter.com/antoniostoilkov/status/1539576912498118656.

## Use Cases

- You want to turn a synchronous function into a non-blocking asynchronous function. **Avoids UI freezes.**
- You want to render important elements first and less urgent ones second. **Improves perceived performance.**
- You want to run a long background task that doesn't spin the fans after a while. **Avoids bad reputation.**
- You want to run multiple backgrounds tasks that don't degrade your app performance with time. **Prevents death by a thousand cuts.**

## How It Works

- Uses `MessageChannel.postMessage()` and `requestIdleCallback()` for scheduling.
- Stops task execution when user interacts with the UI (if `navigator.scheduling.isInputPending()` API is available).
- Global queue. Multiple tasks are executed one by one so increasing the number of tasks doesn't degrade performance linearly.
- Sorts tasks by importance. Sorts by [priority](#priorities) and gives priority to tasks requested later.
- Considerate about your existing code. Tasks with `background` priority are executed last so there isn't some unexpected work that slows down the main thread after the background task is finished.

## Why

Why rely on some open-source library to ensure a good performance for my app?
- **Not a weekend project.** Actively maintained for over a year — see [contributors](https://github.com/astoilkov/main-thread-scheduling/graphs/contributors) page. I've been using it in my own products for over two years — [Nota](https://nota.md) and [iBar](https://ibar.app). [Flux.ai](https://flux.ai/) are also using it in their product (software for designing hardware circuits using web technologies).
- **This is the future.** [Some browsers](https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/postTask#browser_compatibility) have already implemented support for scheduling tasks on the main thread. This library tries even harder to improve user perceived performance — see [explanation](#scheduler-yield-alternative) for details.
- **Simple.** 90% of the time you only need the `yieldOrContinue(priority)` function. The API has two more functions for more advanced cases.
- **High quality.** Aiming for high-quality with [my open-source principles](https://astoilkov.com/my-open-source-principles).

## Example

You can see the library in action in [this CodeSandbox](https://codesandbox.io/s/main-thread-scheduling-example-qqef6?file=/src/App.js:1188-1361). Try removing the call to `yieldToContinue()` and then type in the input to see the difference.

## API

#### `yieldOrContinue(priority: 'background' | 'user-visible')`

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

#### `requestAfterFrame(callback)`

_This is a utility function, most people don't need to use it._ The same way `requestAnimationFrame()` queues a `callback` to be executed just before a frame is rendered `requestAfterFrame()` is called just after a frame is rendered.

#### `queueTask(callback)`

_This is a utility function, most people don't need to use it._ The same way `queueMicrotask()` queues a `callback` to be executed in the microtask queue `queueTask()` queues the task for the next task. You learn more at [here](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide#tasks_vs._microtasks).

### More complex scenarios

The library has two more functions available:
- `yieldControl(priority: 'background' | 'user-visible')`
- `isTimeToYield(priority: 'background' | 'user-visible')`

These two functions are used together to handle more advanced use cases.

A simple use case where you will need those two functions is when you want to render your view before yielding back control to the browser to continue its work:
```ts
async function doHeavyWork() {
    for (const value of values) {
        if (isTimeToYield('user-visible')) {
            render()
            await yieldControl('user-visible')
        }
        
        computeHeavyWorkOnValue(value)
    }
}
```

### Priorities

There are two priorities available: `user-visible` and `background`:
- `user-visible` – use this for things that need to display to the user as fast as possible. Every `user-visible` task is run for 83ms – this gives you a nice cycle of doing heavy work and letting the browser render pending changes.
- `background` – use this for background tasks. Every background task is run for 5ms.

## Alternatives

<div id="scheduler-yield-alternative"></div>

### `scheduler.postTask()`

[`scheduler.postTask()`](https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/postTask) is available in some browsers today. `postTask` is a great alternative, you just need to have a better understanding on its inner workings. `main-thread-scheduling` aims to be easier to use. For example, `main-thread-scheduling` uses the `isInputPending()` API to ensure the UI doesn't freeze when the user interacts with the page (if you use `scheduler.postTask()` you will need to do that manually). Also, if you have running animations while running your tasks, you will see `main-thread-scheduling` perform better.

### Web Workers

Web Workers are a great fit if you have: 1) heavy algorithm (e.g. image processing), 2) heavy process (runs for a long time, big part of the app lifecycle). However, in reality, it's rare to see people using them. That's because they require significant investment of time due to the complexity that can't be avoided when working with CPU threads regardless of the programming language. This library can be used as a gateway before transitioning to Web Workers. In most cases, you would discover the doing it on the main thread is good enough.
