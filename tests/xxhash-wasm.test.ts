import { describe, expect, it } from 'vitest';
import xxhash from 'xxhash-wasm';

// Empty/a/abc are standard XXH vectors; the remaining vectors were generated
// with xxhash-wasm 1.1.0's Node entry. This suite also runs via its workerd entry.
const vectors = [
    { input: '', h32: '02cc5d05', h64: 'ef46db3751d8e999', seed32: 'bd209070', seed64: '51e24c0e9077a48c' },
    { input: 'a', h32: '550d7456', h64: 'd24ec4f1a98c6e5b', seed32: '0d5a8e75', seed64: '63a379f532ba23d4' },
    { input: 'abc', h32: '32d153ff', h64: '44bc2cf5ad770999', seed32: '11364062', seed64: '1fc03ef74cebaa7d' },
    { input: '0123456789abcdef'.repeat(5), h32: '3fe8e7af', h64: '0d4cc7d5057880df', seed32: 'e0c25edb', seed64: '3d2aa4692d5507dc' },
    { input: 'RSSHub 中文 🐧', h32: '57c604bf', h64: '24862e5b32f4f03f', seed32: '129c225f', seed64: '163f1ecdcce47f0a' },
    { input: '/gov/zhengce/zhengceku/bmwj:json', h32: 'e008b760', h64: '390f38bd8df8e23e', seed32: 'abc5ecf2', seed64: 'b1183e2c2e5ba95d' },
    { input: '/gov/zhengce/zhengceku/bmwj:json:47', h32: 'f144b479', h64: '24d1ed2f1309ed35', seed32: 'f6461457', seed64: '2675f5df8c4442da' },
];

const hash = await xxhash();

describe('official xxhash Node and Worker parity', () => {
    it.each(vectors)('matches known 32/64-bit and seeded vectors for $input', (vector) => {
        const bytes = new TextEncoder().encode(vector.input);
        expect(hash.h32ToString(vector.input)).toBe(vector.h32);
        expect(hash.h64ToString(vector.input)).toBe(vector.h64);
        expect(hash.h32(vector.input)).toBe(Number.parseInt(vector.h32, 16));
        expect(hash.h64(vector.input)).toBe(BigInt('0x' + vector.h64));
        expect(hash.h32Raw(bytes)).toBe(Number.parseInt(vector.h32, 16));
        expect(hash.h64Raw(bytes)).toBe(BigInt('0x' + vector.h64));
        expect(hash.h32ToString(vector.input, 0x12_34_56_78)).toBe(vector.seed32);
        expect(hash.h64ToString(vector.input, 0x01_23_45_67_89_ab_cd_efn)).toBe(vector.seed64);
    });

    it('supports streaming mixed strings and byte subarrays across block boundaries', () => {
        const prefix = '0123456789abcdef'.repeat(5);
        const bytes = new TextEncoder().encode('skipRSSHub 中文 🐧skip');
        const suffix = bytes.subarray(4, -4);
        const h32 = hash.create32(0x12_34_56_78);
        const h64 = hash.create64(0x01_23_45_67_89_ab_cd_efn);
        for (const chunk of [prefix.slice(0, 7), prefix.slice(7), suffix]) {
            h32.update(chunk);
            h64.update(chunk);
        }
        expect(h32.digest()).toBe(hash.h32(prefix + 'RSSHub 中文 🐧', 0x12_34_56_78));
        expect(h64.digest()).toBe(hash.h64(prefix + 'RSSHub 中文 🐧', 0x01_23_45_67_89_ab_cd_efn));
    });

    it('does not retain the polynomial shim collision', () => {
        expect(hash.h64ToString('Aa')).not.toBe(hash.h64ToString('BB'));
    });
});
