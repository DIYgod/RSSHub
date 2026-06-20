import zlib from 'node:zlib';

import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import parser from '@/utils/rss-parser';

const rssXml = '<rss version="2.0"><channel><title>Test</title><item><title>Item</title></item></channel></rss>';

const toArrayBuffer = (buf: Buffer): ArrayBuffer => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;

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
});
