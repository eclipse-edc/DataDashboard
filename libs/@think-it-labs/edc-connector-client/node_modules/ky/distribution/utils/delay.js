// https://github.com/sindresorhus/delay/tree/ab98ae8dfcb38e1593286c94d934e70d14a4e111
import { composeAbortError } from '../errors/DOMException.js';
export default async function delay(ms, { signal }) {
    return new Promise((resolve, reject) => {
        if (signal) {
            if (signal.aborted) {
                reject(composeAbortError(signal));
                return;
            }
            signal.addEventListener('abort', handleAbort, { once: true });
        }
        function handleAbort() {
            reject(composeAbortError(signal));
            clearTimeout(timeoutId);
        }
        const timeoutId = setTimeout(() => {
            signal?.removeEventListener('abort', handleAbort);
            resolve();
        }, ms);
    });
}
//# sourceMappingURL=delay.js.map