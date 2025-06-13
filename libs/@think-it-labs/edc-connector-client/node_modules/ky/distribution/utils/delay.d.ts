import { InternalOptions } from '../types/options.js';
export interface DelayOptions {
    signal?: InternalOptions['signal'];
}
export default function delay(ms: number, { signal }: DelayOptions): Promise<void>;
