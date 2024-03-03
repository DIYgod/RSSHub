const debug = {
    hitCache: 0,
    request: 0,
    etag: 0,
    error: 0,
};

export const getDebugInfo = () => debug;
export const setDebugInfo = (info: typeof debug) => Object.assign(debug, info);
