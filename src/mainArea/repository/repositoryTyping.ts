export interface RequireReturnType<T> {
    [key: string]: (...args: any[]) => T;
}
