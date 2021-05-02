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

<br>

## Install

```shell
npm install main-thread-scheduling
```

## Why

Making a responsive app is hard. With time apps get more complex and keeping your app responsive becomes even harder. It's possible to overcome this by using Web Workers but if you tried it you know that it's very hard to do in reality.

This library keeps everything on the main thread. This allows for a very small and simple API that can be integrated easily in existing code bases.

Here a few more advantages:
- Simple. 90% of the time you only need `yieldOrContinue(priority)` function. The API has two more functions for more advanced cases.
- Utilizes the new `navigator.scheduling.isInputPending()` method (when available). Fallbacks to a good enough alternative otherwise.
- This isn't a weekend project. I have been working on this code for months. If you want to dive more deeply read the [in-depth](./docs/in-depth.md) doc.
- This is the future. Browsers are probably going to support scheduling tasks on the main thread in the future. Here is the [spec](https://github.com/WICG/scheduling-apis).
- Aiming for high-quality with [my open-source principles](https://github.com/astoilkov/me/blob/master/essays/My%20open-source%20principles.md)

## API

Note: If you want to understand how this library works under the hook and some of the details – read the [in-depth](./docs/in-depth.md) doc.

### `yieldOrContinue(priority: 'background' | 'user-visible')`

The complexity of the entire library is hidden behind this method. You will have great app performance by calling a single method.

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
- `background` – use this for background tasks. Every background task is run for 5ms – this ensures that the CPU fan of your user won't turn on.
- `user-visible` – use this for things that needs to display to the user as fast as possible. Every `user-visible` task is run for 50ms – this gives you a nice cycle of doing heavy work and letting the browser render pending changes.

If you have a use case for a third priority see the issue [here]().

## Alternatives

The problem this library solves isn't new. However, I haven't found a library that can solve this problem in a simple manner. [Open an issue](https://github.com/astoilkov/main-thread-scheduling/issues/new) if there is such a library so I can add it here.

React has an implementation for scheduling tasks – [react/scheduler](https://github.com/facebook/react/tree/3c7d52c3d6d316d09d5c2479c6851acecccc6325/packages/scheduler). They plan to make it more generic but I don't know the timeline for this.