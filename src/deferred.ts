import { BaseFunction } from './types';

export interface Deferred {
    /**
     * The current delay
     */
    delay: number;
    /**
     * when defer was run
     */
    deferred: number;
    /**
     * When it was last run
     */
    called: number;
    defer: (delay: number) => void;
    cancel: () => void;
}

// internal
const deferred = (callback: BaseFunction): Deferred => {
    let handle: any = null;
    let clear: BaseFunction = clearTimeout;

    let call = () => {
        deferred.called = Date.now();
        deferred.delay = -1;
        callback();
    };

    const defer = (delay: number) => {
        delay = delay < 0 ? 0 : delay;
        deferred.deferred = Date.now();
        // 0 delay still pending, no point clearing and restarting
        if (delay === 0 && deferred.delay === 0) {
            return;
        }
        // clear existing
        if (handle !== null) clear(handle);

        deferred.delay = delay;
        const useTimeout = !setImmediate || delay ? true : false;
        clear = useTimeout ? clearTimeout : clearImmediate;
        if (useTimeout) {
            handle = setTimeout(call, delay || 0);
        } else {
            handle = setImmediate(call);
        }
    };

    const cancel = () => {
        if (handle !== null) {
            deferred.delay = -1;
            clear(handle);
            handle = null;
        }
    };

    const deferred: Deferred = {
        called: 0,
        deferred: 0,
        delay: -1,
        defer,
        cancel
    };
    return deferred;
};

export default deferred;