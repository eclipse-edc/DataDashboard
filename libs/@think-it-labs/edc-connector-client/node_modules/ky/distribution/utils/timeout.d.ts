export type TimeoutOptions = {
    timeout: number;
    fetch: typeof fetch;
};
export default function timeout(request: Request, abortController: AbortController | undefined, options: TimeoutOptions): Promise<Response>;
