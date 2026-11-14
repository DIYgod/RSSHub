import { describe, expect, it } from 'vitest';

import { distinguishDuplicateGuids } from '@/utils/distinguish-duplicate-guids';

describe('distinguishDuplicateGuids', () => {
    it('preserves existing identities even if the upstream list changes order', () => {
        const unique = { title: 'Unique', link: '/unique', sourceId: '8' };
        const primary = { title: 'Primary', link: '/article', sourceId: '2' };
        const duplicate = { title: 'Other entry', link: 'https://example.com/article', sourceId: '3' };

        for (const order of [
            [unique, primary, duplicate, duplicate],
            [duplicate, primary, unique],
        ]) {
            const result = distinguishDuplicateGuids(order, 'fixture-', 'https://example.com');
            expect(Object.fromEntries(result.map((item) => [item.title, item.guid || item.link]))).toEqual({
                Unique: '/unique',
                Primary: '/article',
                'Other entry': 'fixture-3',
            });
            expect(result).toHaveLength(3);
            expect(result.every((item) => !Object.hasOwn(item, 'sourceId'))).toBe(true);
        }
    });
});
