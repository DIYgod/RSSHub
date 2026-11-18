/**
 * Parses a duration to seconds.
 *
 * @param duration - A number of seconds, or a string like `59`, `01:01`, `1:01:01` or `0:00:01.5`.
 * @returns The total seconds, or `undefined` when the input is not a duration.
 */
export function parseDuration(duration: number | string | undefined | null): number | undefined {
    if (typeof duration === 'number') {
        return Number.isFinite(duration) && duration >= 0 ? duration : undefined;
    }
    if (typeof duration !== 'string') {
        return;
    }
    const text = duration.trim();
    if (!/^(?:\d+:(?:[0-5]?\d:)?[0-5]?\d|\d+)(?:\.\d+)?$/.test(text)) {
        return;
    }
    const seconds = text.split(':').reduce((total, part) => total * 60 + Number(part), 0);
    return Number.isFinite(seconds) ? seconds : undefined;
}
