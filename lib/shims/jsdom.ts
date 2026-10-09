const unavailable = () => {
    throw new Error('jsdom is unavailable on Workers');
};
export const JSDOM = unavailable;
export const VirtualConsole = unavailable;
