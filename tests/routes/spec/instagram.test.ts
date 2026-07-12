import '../../setup';

import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { assertSpecExtra } from '@/types/spec-extra.zod';
import jsonView from '@/views/json';

const fixture = JSON.parse(readFileSync(path.join(import.meta.dirname, '../../fixtures/spec-instagram.json'), 'utf-8')) as { _extras: unknown[] };

const USERNAME = 'instagram';

async function callHandler(username: string) {
    const { route } = await import('@/routes/spec/instagram');
    const ctx = {
        req: { param: (k: string) => ({ username })[k] },
    } as any;
    return route.handler(ctx);
}

describe('spec/instagram route', () => {
    it('matches snapshot — _extra shape matches the recorded fixture', async () => {
        const data = await callHandler(USERNAME);
        expect(data.item!.length).toBe(fixture._extras.length);
        expect(data.item!.map((i) => i._extra)).toEqual(fixture._extras);
    });

    it('happy path — returns posts with _extra', async () => {
        const data = await callHandler(USERNAME);
        expect(data.item!.length).toBeGreaterThan(0);
        const item = data.item![0];
        expect(item._extra?.platform).toBe('instagram');
        expect(item._extra?.type).toBe('instagram/post');
        expect(item._extra?.username).toBe(USERNAME);
        expect(item._extra?.shortcode).toBe('AbCdEfGhIjK');
    });

    it('JSON feed view preserves _extra on each item', async () => {
        const data = await callHandler(USERNAME);
        const feed = JSON.parse(jsonView(data));
        expect(feed.items.length).toBeGreaterThan(0);
        expect(feed.items[0]._extra.platform).toBe('instagram');
    });

    it('_extra payload validates against the Zod contract', async () => {
        const data = await callHandler(USERNAME);
        for (const item of data.item!) {
            expect(() => assertSpecExtra(item._extra)).not.toThrow();
        }
    });

    it('empty timeline — returns empty item array', async () => {
        const { http, HttpResponse } = await import('msw');
        const { server } = await import('../../mocks/server');
        server.use(
            http.get('https://www.instagram.com/api/v1/users/web_profile_info/', () =>
                HttpResponse.json({
                    data: {
                        user: {
                            id: '25025320',
                            username: USERNAME,
                            full_name: 'Instagram',
                            biography: 'Empty',
                            profile_pic_url: 'https://instagram.com/avatar.jpg',
                            edge_felix_video_timeline: { edges: [] },
                            edge_owner_to_timeline_media: { edges: [] },
                        },
                    },
                })
            )
        );
        const data = await callHandler(USERNAME);
        expect(data.item).toEqual([]);
    });
});
