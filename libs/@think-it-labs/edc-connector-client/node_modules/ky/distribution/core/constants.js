export const supportsRequestStreams = (() => {
    let duplexAccessed = false;
    let hasContentType = false;
    const supportsReadableStream = typeof globalThis.ReadableStream === 'function';
    const supportsRequest = typeof globalThis.Request === 'function';
    if (supportsReadableStream && supportsRequest) {
        hasContentType = new globalThis.Request('https://a.com', {
            body: new globalThis.ReadableStream(),
            method: 'POST',
            // @ts-expect-error - Types are outdated.
            get duplex() {
                duplexAccessed = true;
                return 'half';
            },
        }).headers.has('Content-Type');
    }
    return duplexAccessed && !hasContentType;
})();
export const supportsAbortController = typeof globalThis.AbortController === 'function';
export const supportsResponseStreams = typeof globalThis.ReadableStream === 'function';
export const supportsFormData = typeof globalThis.FormData === 'function';
export const requestMethods = ['get', 'post', 'put', 'patch', 'head', 'delete'];
const validate = () => undefined;
validate();
export const responseTypes = {
    json: 'application/json',
    text: 'text/*',
    formData: 'multipart/form-data',
    arrayBuffer: '*/*',
    blob: '*/*',
};
// The maximum value of a 32bit int (see issue #117)
export const maxSafeTimeout = 2147483647;
export const stop = Symbol('stop');
//# sourceMappingURL=constants.js.map