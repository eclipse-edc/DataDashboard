import { TimeoutError } from '../errors/TimeoutError.js';
// `Promise.race()` workaround (#91)
export default async function timeout(request, abortController, options) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            if (abortController) {
                abortController.abort();
            }
            reject(new TimeoutError(request));
        }, options.timeout);
        void options
            .fetch(request)
            .then(resolve)
            .catch(reject)
            .then(() => {
            clearTimeout(timeoutId);
        });
    });
}
//# sourceMappingURL=timeout.js.map