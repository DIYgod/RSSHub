import { describe, expect, it } from '@jest/globals';
import { getRouteNameFromPath } from '@/utils/helpers';

describe('helpers', () => {
    it('getRouteNameFromPath', () => {
        expect(getRouteNameFromPath('/test/1')).toBe('test');
    });
});
