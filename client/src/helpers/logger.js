const isDev = import.meta.env.DEV;
const noop = () => {};

const logger = isDev
    ? {
        info:  (...args) => console.info('[INFO]',  ...args),
        warn:  (...args) => console.warn('[WARN]',  ...args),
        debug: (...args) => console.debug('[DEBUG]', ...args),
        error: (...args) => console.error('[ERROR]', ...args),
    }
    : { info: noop, warn: noop, debug: noop, error: noop };

export default logger;
