import { beforeEach, describe, expect, it, vi } from 'vitest';

import { route } from '../lib/routes/lofter/tag';
import got from '../lib/utils/got';

vi.mock('../lib/config', () => ({ config: { lofter: { cookies: 'test-cookie' } } }));
vi.mock('../lib/utils/got', () => ({ default: vi.fn() }));

beforeEach(() => {
    vi.clearAllMocks();
});

const context = { req: { param: (name: string) => ({ name: 'Photography', type: 'date' })[name] } };

describe('Lofter tag DWR response', () => {
    it('reads DWR object references and preserves feed content without executing the response', async () => {
        // A representative DWR protocol response; no private feed data is included.
        vi.mocked(got).mockResolvedValue({
            data: `//#DWR-INSERT
//#DWR-REPLY
var s0=[],s1={},s2={},s3={};
s0[0]=s1;s1.post=s2;s2.blogInfo=s3;
s3.blogNickName="Photographer";
s2.blogPageUrl="https://example.lofter.com/post/1";
s2.title="";
s2.digest="<p>A &amp; B</p>";
s2.publishTime=1704067200000;
s2.tagList=["Photography"];
s2.photoLinks='[{"orign":"https://example.com/photo.jpg"}]';
s2.embed='{"h256Url":"https://example.com/video.mp4","video_img_url":"https://example.com/poster.jpg"}';
dwr.engine._remoteHandleCallback('493053','0',s0);`,
        });

        const feed = await (route.handler as (ctx: typeof context) => Promise<any>)(context);

        expect(feed.title).toBe('Photography - 日榜 | LOFTER');
        expect(feed.item).toEqual([
            {
                author: 'Photographer',
                link: 'https://example.lofter.com/post/1',
                title: 'Photographer：A & B',
                pubDate: new Date('2024-01-01T00:00:00.000Z'),
                description:
                    '<video src="https://example.com/video.mp4" poster="https://example.com/poster.jpg" controls="controls"></video><img src="https://example.com/photo.jpg"/><html><head></head><body><p>A &amp; B</p></body></html>',
                category: ['Photography'],
            },
        ]);
        expect(got).toHaveBeenCalledWith(expect.objectContaining({ headers: { Referer: 'https://www.lofter.com/tag/Photography', Cookie: 'test-cookie' } }));
    });

    it('reads the empty callback response returned by the public endpoint', async () => {
        vi.mocked(got).mockResolvedValue({ data: "//#DWR-INSERT\n//#DWR-REPLY\ndwr.engine._remoteHandleCallback('493053','0',[]);" });

        const feed = await (route.handler as (ctx: typeof context) => Promise<any>)(context);
        expect(feed.item).toEqual([]);
    });

    it('rejects executable callback arguments', async () => {
        vi.mocked(got).mockResolvedValue({ data: "dwr.engine._remoteHandleCallback('493053','0',fetch('https://example.com'));" });

        await expect((route.handler as (ctx: typeof context) => Promise<any>)(context)).rejects.toThrow();
    });
});
