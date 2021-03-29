<div align="center">
<br>
<br>
<img width="200px" src="media/logo.png">
<br>
<br>
</div>

**main-thread-scheduling** — consistently responsive apps while staying on the main thread

## Install

```shell
npm install main-thread-scheduling
```

## Why

Making a responsive app is hard. With time apps get more complex and keeping your app responsive becomes even harder. It's possible to overcome this by moving a lot of the work out of the main thread but this is technically challenging and it takes a lot of time.

This library keeps everything on the main thread. This allows for a very small and simple API that can be integrated easily in existing code bases.

Here a few more advantages:
- API is only 3 functions. All the complexity is hidden behind a single function. The other two functions are for more advanced use cases.
- This isn't a weekend project. I have been working on this solution for months. If you want to dive more deeply read the [design doc]().
- This is the future. Browsers are probably going to support scheduling tasks on the main thread in the future. Here is the [spec](https://github.com/WICG/scheduling-apis).
- Aiming for high-quality with [my open-source principles](https://github.com/astoilkov/me/blob/master/essays/My%20open-source%20principles.md)

## API

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

## Alternatives

The problem this library solves isn't new. However, I haven't found a library that can solve this problem in a simple manner. [Open an issue](https://github.com/astoilkov/main-thread-scheduling/issues/new) if there is such a library so I can add it here.

React has an implementation – [react/scheduler](https://github.com/facebook/react/tree/3c7d52c3d6d316d09d5c2479c6851acecccc6325/packages/scheduler). They plan to make it more generic but I don't have a timeline for that.