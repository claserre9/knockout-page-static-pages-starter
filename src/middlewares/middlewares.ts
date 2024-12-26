export function logPathMiddleware(context: { path: string }, next: () => void): void {
    console.log(`%c${context.path}`, 'color: white; background-color: blue; padding: 4px; border-radius: 4px;');
    next();
}
