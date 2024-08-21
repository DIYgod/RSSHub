import { describe, expect, it, vi, afterEach, afterAll } from 'vitest';
import Parser from 'rss-parser';

const parser = new Parser();

afterAll(() => {
    delete process.env.HOTLINK_TEMPLATE;
    delete process.env.HOTLINK_INCLUDE_PATHS;
    delete process.env.HOTLINK_EXCLUDE_PATHS;
    delete process.env.ALLOW_USER_HOTLINK_TEMPLATE;
});

afterEach(() => {
    delete process.env.HOTLINK_TEMPLATE;
    delete process.env.HOTLINK_INCLUDE_PATHS;
    delete process.env.HOTLINK_EXCLUDE_PATHS;
    delete process.env.ALLOW_USER_HOTLINK_TEMPLATE;
    vi.resetModules();
});

const expects = {
    complicated: {
        origin: {
            items: [
                `<a href="https://mock.com/DIYgod/RSSHub"></a>
<img src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">

<a href="http://mock.com/DIYgod/RSSHub"></a>
<img src="https://mock.com/DIYgod/RSSHub.jpg" data-src="/DIYgod/RSSHub0.jpg" referrerpolicy="no-referrer">
<img data-src="/DIYgod/RSSHub.jpg" src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">
<img data-mock="/DIYgod/RSSHub.png" src="https://mock.com/DIYgod/RSSHub.png" referrerpolicy="no-referrer">
<img mock="/DIYgod/RSSHub.gif" src="https://mock.com/DIYgod/RSSHub.gif" referrerpolicy="no-referrer">
<img src="http://mock.com/DIYgod/DIYgod/RSSHub" referrerpolicy="no-referrer">
<img src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">
<img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" referrerpolicy="no-referrer">`,
                `<a href="https://mock.com/DIYgod/RSSHub"></a>
<img src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">`,
            ],
            desc: '<img src="http://mock.com/DIYgod/DIYgod/RSSHub"> - Powered by RSSHub',
        },
        processed: {
            items: [
                `<a href="https://mock.com/DIYgod/RSSHub"></a>
<img src="https://i3.wp.com/mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">

<a href="http://mock.com/DIYgod/RSSHub"></a>
<img src="https://i3.wp.com/mock.com/DIYgod/RSSHub.jpg" data-src="/DIYgod/RSSHub0.jpg" referrerpolicy="no-referrer">
<img data-src="/DIYgod/RSSHub.jpg" src="https://i3.wp.com/mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">
<img data-mock="/DIYgod/RSSHub.png" src="https://i3.wp.com/mock.com/DIYgod/RSSHub.png" referrerpolicy="no-referrer">
<img mock="/DIYgod/RSSHub.gif" src="https://i3.wp.com/mock.com/DIYgod/RSSHub.gif" referrerpolicy="no-referrer">
<img src="https://i3.wp.com/mock.com/DIYgod/DIYgod/RSSHub" referrerpolicy="no-referrer">
<img src="https://i3.wp.com/mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">
<img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" referrerpolicy="no-referrer">`,
                `<a href="https://mock.com/DIYgod/RSSHub"></a>
<img src="https://i3.wp.com/mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">`,
            ],
            desc: '<img src="https://i3.wp.com/mock.com/DIYgod/DIYgod/RSSHub"> - Powered by RSSHub',
        },
        urlencoded: {
            items: [
                `<a href="https://mock.com/DIYgod/RSSHub"></a>
<img src="https://images.weserv.nl?url=https%3A%2F%2Fmock.com%2FDIYgod%2FRSSHub.jpg" referrerpolicy="no-referrer">

<a href="http://mock.com/DIYgod/RSSHub"></a>
<img src="https://images.weserv.nl?url=https%3A%2F%2Fmock.com%2FDIYgod%2FRSSHub.jpg" data-src="/DIYgod/RSSHub0.jpg" referrerpolicy="no-referrer">
<img data-src="/DIYgod/RSSHub.jpg" src="https://images.weserv.nl?url=https%3A%2F%2Fmock.com%2FDIYgod%2FRSSHub.jpg" referrerpolicy="no-referrer">
<img data-mock="/DIYgod/RSSHub.png" src="https://images.weserv.nl?url=https%3A%2F%2Fmock.com%2FDIYgod%2FRSSHub.png" referrerpolicy="no-referrer">
<img mock="/DIYgod/RSSHub.gif" src="https://images.weserv.nl?url=https%3A%2F%2Fmock.com%2FDIYgod%2FRSSHub.gif" referrerpolicy="no-referrer">
<img src="https://images.weserv.nl?url=http%3A%2F%2Fmock.com%2FDIYgod%2FDIYgod%2FRSSHub" referrerpolicy="no-referrer">
<img src="https://images.weserv.nl?url=https%3A%2F%2Fmock.com%2FDIYgod%2FRSSHub.jpg" referrerpolicy="no-referrer">
<img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" referrerpolicy="no-referrer">`,
                `<a href="https://mock.com/DIYgod/RSSHub"></a>
<img src="https://images.weserv.nl?url=https%3A%2F%2Fmock.com%2FDIYgod%2FRSSHub.jpg" referrerpolicy="no-referrer">`,
            ],
            desc: '<img src="https://images.weserv.nl?url=http%3A%2F%2Fmock.com%2FDIYgod%2FDIYgod%2FRSSHub"> - Powered by RSSHub',
        },
    },
    multimedia: {
        origin: {
            items: [
                `<img src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">
<video src="https://mock.com/DIYgod/RSSHub.mp4"></video>
<video poster="https://mock.com/DIYgod/RSSHub.jpg">
<source src="https://mock.com/DIYgod/RSSHub.mp4" type="video/mp4">
<source src="https://mock.com/DIYgod/RSSHub.webm" type="video/webm">
</video>
<audio src="https://mock.com/DIYgod/RSSHub.mp3"></audio>
<iframe src="https://mock.com/DIYgod/RSSHub.html" referrerpolicy="no-referrer"></iframe>`,
            ],
            desc: '<video src="http://mock.com/DIYgod/DIYgod/RSSHub"></video> - Powered by RSSHub',
        },
        relayed: {
            items: [
                `<img src="https://i3.wp.com/mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">
<video src="https://i3.wp.com/mock.com/DIYgod/RSSHub.mp4"></video>
<video poster="https://i3.wp.com/mock.com/DIYgod/RSSHub.jpg">
<source src="https://i3.wp.com/mock.com/DIYgod/RSSHub.mp4" type="video/mp4">
<source src="https://i3.wp.com/mock.com/DIYgod/RSSHub.webm" type="video/webm">
</video>
<audio src="https://i3.wp.com/mock.com/DIYgod/RSSHub.mp3"></audio>
<iframe src="https://mock.com/DIYgod/RSSHub.html" referrerpolicy="no-referrer"></iframe>`,
            ],
            desc: '<video src="https://i3.wp.com/mock.com/DIYgod/DIYgod/RSSHub"></video> - Powered by RSSHub',
        },
        partlyRelayed: {
            items: [
                `<img src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">
<video src="https://i3.wp.com/mock.com/DIYgod/RSSHub.mp4"></video>
<video poster="https://i3.wp.com/mock.com/DIYgod/RSSHub.jpg">
<source src="https://i3.wp.com/mock.com/DIYgod/RSSHub.mp4" type="video/mp4">
<source src="https://i3.wp.com/mock.com/DIYgod/RSSHub.webm" type="video/webm">
</video>
<audio src="https://i3.wp.com/mock.com/DIYgod/RSSHub.mp3"></audio>
<iframe src="https://mock.com/DIYgod/RSSHub.html" referrerpolicy="no-referrer"></iframe>`,
            ],
            desc: '<video src="https://i3.wp.com/mock.com/DIYgod/DIYgod/RSSHub"></video> - Powered by RSSHub',
        },
    },
};

const testAntiHotlink = async (path, expectObj, query?: string | Record<string, any>) => {
    const app = (await import('@/app')).default;

    let queryStr;
    if (query) {
        queryStr =
            typeof query === 'string'
                ? query
                : Object.entries(query)
                      .map(([key, value]) => `${key}=${value}`)
                      .join('&');
    }
    path = path + (queryStr ? `?${queryStr}` : '');

    const response = await app.request(path);
    const parsed = await parser.parseString(await response.text());
    expect({
        items: parsed.items.slice(0, expectObj.items.length).map((i) => i.content),
        desc: parsed.description,
    }).toStrictEqual(expectObj);

    return parsed;
};

const expectImgOrigin = (query?: string | Record<string, any>) => testAntiHotlink('/test/complicated', expects.complicated.origin, query);
const expectImgProcessed = (query?: string | Record<string, any>) => testAntiHotlink('/test/complicated', expects.complicated.processed, query);
const expectImgUrlencoded = (query?: string | Record<string, any>) => testAntiHotlink('/test/complicated', expects.complicated.urlencoded, query);
const expectMultimediaOrigin = (query?: string | Record<string, any>) => testAntiHotlink('/test/multimedia', expects.multimedia.origin, query);
const expectMultimediaRelayed = (query?: string | Record<string, any>) => testAntiHotlink('/test/multimedia', expects.multimedia.relayed, query);
const expectMultimediaPartlyRelayed = (query?: string | Record<string, any>) => testAntiHotlink('/test/multimedia', expects.multimedia.partlyRelayed, query);

describe('anti-hotlink', () => {
    it('template-legacy', async () => {
        process.env.HOTLINK_TEMPLATE = 'https://i3.wp.com/${host}${pathname}';
        await expectImgProcessed();
    });

    it('template-experimental', async () => {
        process.env.HOTLINK_TEMPLATE = 'https://i3.wp.com/${host}${pathname}';
        process.env.ALLOW_USER_HOTLINK_TEMPLATE = 'true';
        await expectImgProcessed();
        await expectMultimediaRelayed({ multimedia_hotlink_template: process.env.HOTLINK_TEMPLATE });
    });

    it('url', async () => {
        process.env.HOTLINK_TEMPLATE = '${protocol}//${host}${pathname}';
        await expectImgOrigin();
        await expectMultimediaOrigin({ multimedia_hotlink_template: process.env.HOTLINK_TEMPLATE });
    });

    it('url-encoded', async () => {
        process.env.HOTLINK_TEMPLATE = 'https://images.weserv.nl?url=${href_ue}';
        await expectImgUrlencoded();
    });

    it('template-priority-legacy', async () => {
        process.env.HOTLINK_TEMPLATE = '${protocol}//${host}${pathname}';
        await expectImgOrigin();
    });

    it('template-priority-experimental', async () => {
        process.env.ALLOW_USER_HOTLINK_TEMPLATE = 'true';
        await expectImgOrigin();
        await expectImgProcessed({ image_hotlink_template: 'https://i3.wp.com/${host}${pathname}' });
    });

    it('no-template', async () => {
        process.env.HOTLINK_TEMPLATE = '';
        await expectImgOrigin();
        await expectMultimediaOrigin();
    });

    it('multimedia-template-experimental', async () => {
        process.env.ALLOW_USER_HOTLINK_TEMPLATE = 'true';
        await expectMultimediaOrigin({ multimedia_hotlink_template: '${protocol}//${host}${pathname}' });
        await expectMultimediaPartlyRelayed({ multimedia_hotlink_template: 'https://i3.wp.com/${host}${pathname}' });
    });

    it('include-paths-partial-matched', async () => {
        process.env.HOTLINK_TEMPLATE = 'https://i3.wp.com/${host}${pathname}';
        process.env.HOTLINK_INCLUDE_PATHS = '/test';
        await expectImgProcessed();
    });

    it('include-paths-fully-matched', async () => {
        process.env.HOTLINK_TEMPLATE = 'https://i3.wp.com/${host}${pathname}';
        process.env.HOTLINK_INCLUDE_PATHS = '/test/complicated';
        await expectImgProcessed();
    });

    it('include-paths-unmatched', async () => {
        process.env.HOTLINK_TEMPLATE = 'https://i3.wp.com/${host}${pathname}';
        process.env.HOTLINK_INCLUDE_PATHS = '/t';
        await expectImgOrigin();
    });

    it('exclude-paths-partial-matched', async () => {
        process.env.HOTLINK_TEMPLATE = 'https://i3.wp.com/${host}${pathname}';
        process.env.HOTLINK_EXCLUDE_PATHS = '/test';
        await expectImgOrigin();
    });

    it('exclude-paths-fully-matched', async () => {
        process.env.HOTLINK_TEMPLATE = 'https://i3.wp.com/${host}${pathname}';
        process.env.HOTLINK_EXCLUDE_PATHS = '/test/complicated';
        await expectImgOrigin();
    });

    it('exclude-paths-unmatched', async () => {
        process.env.HOTLINK_TEMPLATE = 'https://i3.wp.com/${host}${pathname}';
        process.env.HOTLINK_EXCLUDE_PATHS = '/t';
        await expectImgProcessed();
    });

    it('include-exclude-paths-mixed-filtered-out', async () => {
        process.env.HOTLINK_TEMPLATE = 'https://i3.wp.com/${host}${pathname}';
        process.env.HOTLINK_INCLUDE_PATHS = '/test';
        process.env.HOTLINK_EXCLUDE_PATHS = '/test/complicated';
        await expectImgOrigin();
    });

    it('include-exclude-paths-mixed-unfiltered-out', async () => {
        process.env.HOTLINK_TEMPLATE = 'https://i3.wp.com/${host}${pathname}';
        process.env.HOTLINK_INCLUDE_PATHS = '/test';
        process.env.HOTLINK_EXCLUDE_PATHS = '/test/c';
        await expectImgProcessed();
    });

    it('invalid-property', async () => {
        process.env.HOTLINK_TEMPLATE = 'https://i3.wp.com/${createObjectURL}';
        const app = (await import('@/app')).default;
        const response = await app.request('/test/complicated');
        expect(await response.text()).toContain('Error: Invalid URL property: createObjectURL');
    });
});
