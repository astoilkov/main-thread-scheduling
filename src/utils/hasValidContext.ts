export default function hasValidContext(): boolean {
    // - users of the library who are testing their own codebase shouldn't care about scheduling
    // - for our own tests, we `jest.mock()` this function to always return `true`
    if (hasTestContext()) {
        return false
    }

    // the library is called `main-thread-scheduling`, we don't want to run in a web worker
    if (hasWebWorkerContext()) {
        return false
    }

    // - for now, we don't support Node.js or other non-browser environments
    // - support for scheduling in Node.js is still under consideration for future versions
    // - what about Deno?
    if (!hasWebContext()) {
        return false
    }

    return true
}

function hasTestContext(): boolean {
    // @ts-ignore
    return typeof process !== 'undefined' && process.env.NODE_ENV === 'test'
}

function hasWebContext(): boolean {
    return typeof window !== 'undefined'
}

function hasWebWorkerContext(): boolean {
    return typeof importScripts === 'function'
}
