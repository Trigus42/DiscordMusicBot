export function stringifyRestParams(args: {[key: string]: string|number}) {
    return Object.keys(args)
    .map((key: string) => `?${key}=${args[key]}`)
    .join()
}