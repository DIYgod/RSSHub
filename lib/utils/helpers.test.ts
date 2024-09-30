import { describe, expect, it } from 'vitest';
import { getRouteNameFromPath } from '@/utils/helpers';

describe('helpers', () => {
    it('getRouteNameFromPath', () => {
        expect(getRouteNameFromPath('/test/1')).toBe('test');
    });
});
