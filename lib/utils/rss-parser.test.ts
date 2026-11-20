import zlib from 'node:zlib';

import { http, HttpResponse } from 'msw';
import { describe, expect, it, onTestFinished } from 'vitest';

import { config } from '@/config';
import parser from '@/utils/rss-parser';

const rssXml = '<rss version="2.0"><channel><title>Test</title><item><title>Item</title></item></channel></rss>';

const toArrayBuffer = (buf: Buffer) => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

describe('rss-parser', () => {
    it('rss', async () => {
        const result = await parser.parseURL('http://rsshub.test/rss');
        expect(result).toBeTruthy();
    });

    it('gzip', async () => {
        const { default: server } = await import('@/setup.test');
        const compressed = zlib.gzipSync(Buffer.from(rssXml));
        server.use(
            http.get('http://rsshub.test/rss-gzip', () =>
                HttpResponse.arrayBuffer(toArrayBuffer(compressed), {
                    headers: {
                        'content-type': 'application/xml',
                        'content-encoding': 'gzip',
                    },
                })
            )
        );
        const result = await parser.parseURL('http://rsshub.test/rss-gzip');
        expect(result.title).toBe('Test');
        expect(result.items).toHaveLength(1);
    });

    it('deflate', async () => {
        const { default: server } = await import('@/setup.test');
        const compressed = zlib.deflateSync(Buffer.from(rssXml));
        server.use(
            http.get('http://rsshub.test/rss-deflate', () =>
                HttpResponse.arrayBuffer(toArrayBuffer(compressed), {
                    headers: {
                        'content-type': 'application/xml',
                        'content-encoding': 'deflate',
                    },
                })
            )
        );
        const result = await parser.parseURL('http://rsshub.test/rss-deflate');
        expect(result.title).toBe('Test');
        expect(result.items).toHaveLength(1);
    });

    it('brotli', async () => {
        const { default: server } = await import('@/setup.test');
        const compressed = zlib.brotliCompressSync(Buffer.from(rssXml));
        server.use(
            http.get('http://rsshub.test/rss-br', () =>
                HttpResponse.arrayBuffer(toArrayBuffer(compressed), {
                    headers: {
                        'content-type': 'application/xml',
                        'content-encoding': 'br',
                    },
                })
            )
        );
        const result = await parser.parseURL('http://rsshub.test/rss-br');
        expect(result.title).toBe('Test');
        expect(result.items).toHaveLength(1);
    });

    if (zlib.zstdCompressSync) {
        it('zstd', async () => {
            const { default: server } = await import('@/setup.test');
            const compressed = zlib.zstdCompressSync(Buffer.from(rssXml));
            server.use(
                http.get('http://rsshub.test/rss-zstd', () =>
                    HttpResponse.arrayBuffer(toArrayBuffer(compressed), {
                        headers: {
                            'content-type': 'application/xml',
                            'content-encoding': 'zstd',
                        },
                    })
                )
            );
            const result = await parser.parseURL('http://rsshub.test/rss-zstd');
            expect(result.title).toBe('Test');
            expect(result.items).toHaveLength(1);
        });
    }

    it('does not carry state from one document to the next', async () => {
        const planted = '<rss version="2.0"><channel><title>Planted</title><item><title>Planted item</title></item>';
        await parser.parseString(`${rssXml}text after the root`);
        const [open, victim, close] = await Promise.allSettled([
            parser.parseString(`${planted}<a><b><_>1</_><a><_>1</_></a>`),
            parser.parseString(`<?xml version="1.0" encoding="UTF-8"?>${rssXml}`),
            parser.parseString('></a></channel></rss>'),
        ]);

        expect(victim).toMatchObject({ status: 'fulfilled', value: { title: 'Test' } });
        expect(open.status).toBe('rejected');
        expect(close.status).toBe('rejected');
    });

    it.each([
        ['compressed', 'br', (body: Buffer) => zlib.brotliCompressSync(body)],
        ['uncompressed', 'identity', (body: Buffer) => body],
    ])('rejects a %s feed that is larger than the limit', async (_, encoding, encode) => {
        const { default: server } = await import('@/setup.test');
        // a smaller limit than the default keeps the test fast
        const limit = 1024 * 1024;
        const defaultLimit = config.requestMaxResponseSize;
        config.requestMaxResponseSize = limit;
        onTestFinished(() => {
            config.requestMaxResponseSize = defaultLimit;
        });
        server.use(
            http.get('http://rsshub.test/rss-large', ({ request }) => {
                const size = Number(new URL(request.url).searchParams.get('size'));
                const body = encode(Buffer.from(rssXml.padEnd(size)));
                return HttpResponse.arrayBuffer(toArrayBuffer(body), {
                    headers: {
                        'content-type': 'application/xml',
                        'content-encoding': encoding,
                    },
                });
            })
        );

        expect((await parser.parseURL(`http://rsshub.test/rss-large?size=${limit}`)).title).toBe('Test');
        await expect(parser.parseURL(`http://rsshub.test/rss-large?size=${limit + 1}`)).rejects.toThrow(`Response body is larger than ${limit} bytes`);
    });
});
