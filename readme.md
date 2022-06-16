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
<a href="https://bundlephobia.com/result?p=main-thread-scheduling">
<img src="https://badgen.net/bundlephobia/minzip/main-thread-scheduling" alt="Gzipped Size" />
</a>
<a href="https://codeclimate.com/github/astoilkov/main-thread-scheduling/test_coverage">
<img src="https://img.shields.io/codeclimate/coverage/astoilkov/main-thread-scheduling" alt="Test Coverage" />
</a>
<a href="https://www.travis-ci.com/astoilkov/main-thread-scheduling">
<img src="https://www.travis-ci.com/astoilkov/main-thread-scheduling.svg?branch=master" alt="Build Status" />
</a>
<p>

<br>

## Install

```shell
npm install main-thread-scheduling
```

## Overview

The library lets you run computationally heavy tasks on the main thread while ensuring:
- Your app's UI doesn't freeze.
- Your users' computer fans don't spin.
- It can be easily integrated into your existing codebase.

## Use Cases

- You want to turn a synchronous function into a non-blocking asynchronous function. **Avoids UI freezes.**
- You want to render important elements first and less urgent ones second. **Improves perceived performance.**
- You want to run a long background task that doesn't spin the fans after a while. **Avoids bad reputation.**
- You want to run multiple backgrounds tasks that don't degrade your app performance with time. **Prevents death by a thousand cuts.**

## How It Works

- Stops task execution when user interacts with the UI (if `navigator.scheduling.isInputPending()` API is available).
- Global queue. Multiple tasks are executed one by one so increasing the number of tasks doesn't degrade performance linearly.
- Sorts tasks by importance. Sorts by [priority](#priorities) and gives priority to tasks requested later.
- Considerate about your existing code. Tasks with `background` priority are executed last so there isn't some unexpected work that slows down the main thread after the background task is finished.

## Why

Why rely on some open-source library to ensure a good performance for my app?
- **Not a weekend project.** I've already been using it for over a year in the core of two of my products — [Nota](https://nota.md) and [iBar](https://ibar.app).
- **This is the future.** Browsers are probably going to support scheduling tasks on the main thread in the future. Here is the [spec](https://github.com/WICG/scheduling-apis). This library will still be relevant in the future because it provides an easier API.
- **Simple.** 90% of the time you only need `yieldOrContinue(priority)` function. The API has two more functions for more advanced cases.
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

Currently there are only two priorities available: `background` and `user-visible`:
- `background` – use this for background tasks. Every background task is run for 5ms.
- `user-visible` – use this for things that need to display to the user as fast as possible. Every `user-visible` task is run for 83ms – this gives you a nice cycle of doing heavy work and letting the browser render pending changes.

If you have a use case for a third priority, you can write in [this issue](https://github.com/astoilkov/main-thread-scheduling/issues/1).

## Alternatives

**Web Workers** are a great alternative if you have: 1) heavy code (e.g. image processing), 2) something that isn't a task but a process (runs through a big time of the app lifecycle). However, in reality, it's rare to see people using them. That's because they require significant investment of time due to the complexity that can't be avoided when working with CPU threads regardless of the programming language. This library can be used as a gateway before transitioning to Web Workers. In reality, a lot of the times, you would discover the doing it on the main thread is good enough.

**React scheduler** is a similar implementation. They plan to make it more generic (for use outside of React) but there doesn't seem to be a public roadmap for that.

**[`scheduler.yield()`](https://github.com/WICG/scheduling-apis/blob/main/explainers/yield-and-continuation.md)** will probably land in browsers at some point. However, is `scheduler.yield()` enough? The spec isn't very clear on how it will work so I'm not sure. My guess is that it would be possible go without this library but you will need extra code to do so. That's because you will need to reimplement the `isTimeToYield()` method for which I don't see an alternative in the `scheduling` spec.