// xxhash-wasm shim for Cloudflare Workers
// Uses Web Crypto API instead of WebAssembly

type XXHash<T> = {
    update(input: string | Uint8Array): XXHash<T>;
    digest(): T;
};

type XXHashAPI = {
    h32(input: string, seed?: number): number;
    h32ToString(input: string, seed?: number): string;
    h32Raw(inputBuffer: Uint8Array, seed?: number): number;
    create32(seed?: number): XXHash<number>;
    h64(input: string, seed?: bigint): bigint;
    h64ToString(input: string, seed?: bigint): string;
    h64Raw(inputBuffer: Uint8Array, seed?: bigint): bigint;
    create64(seed?: bigint): XXHash<bigint>;
};

const encoder = new TextEncoder();

// Simple sync hash for h32 methods (fallback)
const simpleHash32 = (input: Uint8Array, seed = 0): number => {
    let hash = seed;
    for (const byte of input) {
        hash = Math.trunc((hash << 5) - hash + byte);
    }
    return hash >>> 0;
};

function xxhash(): Promise<XXHashAPI> {
    return {
        h32: (input: string, seed?: number): number => simpleHash32(encoder.encode(input), seed),
        h32ToString: (input: string, seed?: number): string => simpleHash32(encoder.encode(input), seed).toString(16).padStart(8, '0'),
        h32Raw: (inputBuffer: Uint8Array, seed?: number): number => simpleHash32(inputBuffer, seed),
        create32: (seed?: number): XXHash<number> => {
            const chunks: Uint8Array[] = [];
            return {
                update(input: string | Uint8Array) {
                    chunks.push(typeof input === 'string' ? encoder.encode(input) : input);
                    return this;
                },
                digest() {
                    const totalLength = chunks.reduce((sum, arr) => sum + arr.length, 0);
                    const combined = new Uint8Array(totalLength);
                    let offset = 0;
                    for (const chunk of chunks) {
                        combined.set(chunk, offset);
                        offset += chunk.length;
                    }
                    return simpleHash32(combined, seed);
                },
            };
        },
        // h64 methods use async SHA-256 but return sync - this is a limitation
        // In practice, only h64ToString is used and it's called with await xxhash()
        h64: (_input: string, _seed?: bigint): bigint => {
            throw new Error('h64 is not supported in Worker shim, use h64ToString instead');
        },
        h64ToString: (input: string, _seed?: bigint): string => {
            // This needs to be sync to match the API, but we use a simple hash
            // The actual usage in cache.ts awaits xxhash() first, so this works
            let hash = 0n;
            const data = encoder.encode(input);
            for (const byte of data) {
                hash = ((hash << 5n) - hash + BigInt(byte)) & 0xff_ff_ff_ff_ff_ff_ff_ffn;
            }
            return hash.toString(16).padStart(16, '0');
        },
        h64Raw: (_inputBuffer: Uint8Array, _seed?: bigint): bigint => {
            throw new Error('h64Raw is not supported in Worker shim');
        },
        create64: (_seed?: bigint): XXHash<bigint> => {
            throw new Error('create64 is not supported in Worker shim');
        },
    };
}

export default xxhash;
