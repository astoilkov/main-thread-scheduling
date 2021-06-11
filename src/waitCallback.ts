export default async function waitCallback<T>(
    callback: (callback: () => void, ...args: T[]) => void,
    ...args: T[]
): Promise<void> {
    return new Promise<void>((resolve) => {
        callback(() => {
            resolve()
        }, ...args)
    })
}
