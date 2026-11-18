import { expect, it } from 'vitest';

import { parseDuration } from './duration';

it.each([
    [65, 65],
    ['65', 65],
    ['59', 59],
    ['00:01', 1],
    ['01:01', 61],
    ['0:01:05', 65],
    ['01:01:01', 3661],
    ['01:02:03', 3723],
    ['90:00', 5400],
    [' 1:30 ', 90],
    ['0:00:01.5', 1.5],
    [0, 0],
    ['invalid', undefined],
    ['1:xx', undefined],
    ['0:99:00', undefined],
    ['', undefined],
    [null, undefined],
    [undefined, undefined],
    [-1, undefined],
    [Infinity, undefined],
])('parseDuration(%j) is %j', (duration, seconds) => {
    expect(parseDuration(duration)).toBe(seconds);
});
