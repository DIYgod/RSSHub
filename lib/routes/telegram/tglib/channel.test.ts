import { Api } from 'telegram';
import { describe, expect, it } from 'vitest';

import { getMediaLink, getMessageMediaUrl, withSearchParams } from './channel';

describe('telegram tglib channel', () => {
    it('preserves access auth params in telegram media urls', () => {
        expect(getMessageMediaUrl('https://rsshub.app/telegram/channel/test?key=secret', 'test', 123)).toBe('https://rsshub.app/telegram/media/test/123?key=secret');
        expect(getMessageMediaUrl('https://rsshub.app/telegram/channel/test?code=signed', 'test', 123)).toBe('https://rsshub.app/telegram/media/test/123?code=signed');
        expect(getMessageMediaUrl('https://rsshub.app/telegram/channel/test?key=secret&code=signed', 'test', 123)).toBe('https://rsshub.app/telegram/media/test/123?key=secret&code=signed');
    });

    it('appends thumb without dropping existing query params', () => {
        expect(withSearchParams('https://rsshub.app/telegram/media/test/123?key=secret', { thumb: '' })).toBe('https://rsshub.app/telegram/media/test/123?key=secret&thumb=');
    });

    it('renders video poster urls with preserved auth params', () => {
        const media = new Api.MessageMediaDocument({
            document: new Api.Document({
                id: 1,
                accessHash: 1,
                fileReference: Buffer.alloc(0),
                date: 0,
                mimeType: 'video/mp4',
                size: 1,
                dcId: 1,
                attributes: [new Api.DocumentAttributeVideo({ w: 1280, h: 720, duration: 1 })],
            }),
        });

        expect(getMediaLink('https://rsshub.app/telegram/media/test/123?key=secret', media)).toContain('poster="https://rsshub.app/telegram/media/test/123?key=secret&thumb="');
    });
});
