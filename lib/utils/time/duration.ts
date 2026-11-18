/**
 * Parses a duration string to seconds.
 *
 * @param timeStr - A duration string like "01:01:01" / "01:01" / "59".
 * @returns The total seconds.
 */
export function parseDuration(timeStr: string | undefined | null): number | undefined {
    if (!timeStr) {
        return;
    }
    const clean = timeStr.trim().replaceAll(/[^\d:]/g, '');
    const parts = clean.split(':');
    let total = 0;
    for (const [idx, part] of parts.entries()) {
        const n = Number(part);
        if (Number.isNaN(n)) {
            throw new TypeError(`Invalid segment: ${part}`);
        }
        total += n * Math.pow(60, parts.length - 1 - idx);
    }
    return total;
}
