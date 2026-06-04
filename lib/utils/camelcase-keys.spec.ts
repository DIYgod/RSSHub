import { describe, expect, it } from 'vitest';

import { camelcase, camelcaseKeys } from './camelcase-keys';

describe('test camelcase keys', () => {
    it('case 1 normal', () => {
        const obj = {
            tool: 'too',
            tool_name: 'too_name',

            a_b: 1,
            a: 1,
            b: {
                c_d: 1,
            },
        };

        expect(camelcaseKeys(obj)).toStrictEqual({
            tool: 'too',
            toolName: 'too_name',

            aB: 1,
            a: 1,
            b: {
                cD: 1,
            },
        });
    });

    it('case 2: key has number', () => {
        const obj = {
            b147da0eaecbea00aeb62055: {
                data: {},
            },
            a_c11ab_Ac: [
                {
                    a_b: 1,
                },
                1,
            ],
        };

        expect(camelcaseKeys(obj)).toStrictEqual({
            b147da0eaecbea00aeb62055: {
                data: {},
            },
            aC11abAc: [
                {
                    aB: 1,
                },
                1,
            ],
        });
    });

    it('case 3: not a object', () => {
        const value = 1;
        expect(camelcaseKeys(value)).toBe(value);
    });

    it('case 4: nullable value', () => {
        let value = null as any;
        expect(camelcaseKeys(value)).toBe(value);

        value = undefined;
        expect(camelcaseKeys(value)).toBe(value);

        value = NaN;
        expect(camelcaseKeys(value)).toBe(value);
    });

    it('case 5: array', () => {
        const arr = [
            {
                a_b: 1,
            },
            null,
            undefined,
            +0,
            -0,
            Infinity,
            {
                a_b: 1,
            },
        ];

        expect(camelcaseKeys(arr)).toStrictEqual([
            {
                aB: 1,
            },
            null,
            undefined,
            +0,
            -0,
            Infinity,
            {
                aB: 1,
            },
        ]);
    });

    it('case 6: filter out mongo id', () => {
        const obj = {
            _id: '123',
            a_b: 1,
            collections: {
                posts: {
                    '661bb93307d35005ba96731b': {},
                },
            },
        };

        expect(camelcaseKeys(obj)).toStrictEqual({
            id: '123',
            aB: 1,
            collections: {
                posts: {
                    '661bb93307d35005ba96731b': {},
                },
            },
        });
    });

    it('case 7: start with underscore should not camelcase', () => {
        expect(camelcase('_id')).toBe('id');
    });
});
