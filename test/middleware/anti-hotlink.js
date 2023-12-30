const supertest = require('supertest');
jest.mock('request-promise-native');
const Parser = require('rss-parser');
const querystring = require('query-string');
const parser = new Parser();
jest.setTimeout(50000);
let server;

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
    server.close();
    jest.resetModules();
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
<img src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">`,
                `<a href="https://mock.com/DIYgod/RSSHub"></a>
<img src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">`,
            ],
            desc: '<img src="http://mock.com/DIYgod/DIYgod/RSSHub"> - Made with love by RSSHub(https://github.com/DIYgod/RSSHub)',
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
<img src="https://i3.wp.com/mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">`,
                `<a href="https://mock.com/DIYgod/RSSHub"></a>
<img src="https://i3.wp.com/mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">`,
            ],
            desc: '<img src="https://i3.wp.com/mock.com/DIYgod/DIYgod/RSSHub"> - Made with love by RSSHub(https://github.com/DIYgod/RSSHub)',
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
<img src="https://images.weserv.nl?url=https%3A%2F%2Fmock.com%2FDIYgod%2FRSSHub.jpg" referrerpolicy="no-referrer">`,
                `<a href="https://mock.com/DIYgod/RSSHub"></a>
<img src="https://images.weserv.nl?url=https%3A%2F%2Fmock.com%2FDIYgod%2FRSSHub.jpg" referrerpolicy="no-referrer">`,
            ],
            desc: '<img src="https://images.weserv.nl?url=http%3A%2F%2Fmock.com%2FDIYgod%2FDIYgod%2FRSSHub"> - Made with love by RSSHub(https://github.com/DIYgod/RSSHub)',
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
            desc: '<video src="http://mock.com/DIYgod/DIYgod/RSSHub"></video> - Made with love by RSSHub(https://github.com/DIYgod/RSSHub)',
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
            desc: '<video src="https://i3.wp.com/mock.com/DIYgod/DIYgod/RSSHub"></video> - Made with love by RSSHub(https://github.com/DIYgod/RSSHub)',
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
            desc: '<video src="https://i3.wp.com/mock.com/DIYgod/DIYgod/RSSHub"></video> - Made with love by RSSHub(https://github.com/DIYgod/RSSHub)',
        },
        wrappedInIframe: {
            items: [
                `<img src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">
<iframe referrerpolicy="no-referrer" width="100%" height="150vh" frameborder="0" marginheight="0" marginwidth="0" style="border:0; margin:0; padding:0; width:100%; height:150vh;" srcdoc="
<!DOCTYPE html>
<html>
  <head>
    <meta name=&quot;referrer&quot; content=&quot;no-referrer&quot;>
  </head>
  <body>
    <video src=&quot;https://mock.com/DIYgod/RSSHub.mp4&quot;></video>
  </body>
</html>
">
</iframe>

<iframe referrerpolicy="no-referrer" width="100%" height="150vh" frameborder="0" marginheight="0" marginwidth="0" style="border:0; margin:0; padding:0; width:100%; height:150vh;" srcdoc="
<!DOCTYPE html>
<html>
  <head>
    <meta name=&quot;referrer&quot; content=&quot;no-referrer&quot;>
  </head>
  <body>
    <video poster=&quot;https://mock.com/DIYgod/RSSHub.jpg&quot;>
<source src=&quot;https://mock.com/DIYgod/RSSHub.mp4&quot; type=&quot;video/mp4&quot;>
<source src=&quot;https://mock.com/DIYgod/RSSHub.webm&quot; type=&quot;video/webm&quot;>
</video>
  </body>
</html>
">
</iframe>

<iframe referrerpolicy="no-referrer" width="100%" height="150vh" frameborder="0" marginheight="0" marginwidth="0" style="border:0; margin:0; padding:0; width:100%; height:150vh;" srcdoc="
<!DOCTYPE html>
<html>
  <head>
    <meta name=&quot;referrer&quot; content=&quot;no-referrer&quot;>
  </head>
  <body>
    <audio src=&quot;https://mock.com/DIYgod/RSSHub.mp3&quot;></audio>
  </body>
</html>
">
</iframe>

<iframe src="https://mock.com/DIYgod/RSSHub.html" referrerpolicy="no-referrer"></iframe>`,
            ],
            desc: `<iframe referrerpolicy="no-referrer" width="100%" height="150vh" frameborder="0" marginheight="0" marginwidth="0" style="border:0; margin:0; padding:0; width:100%; height:150vh;" srcdoc="
<!DOCTYPE html>
<html>
  <head>
    <meta name=&quot;referrer&quot; content=&quot;no-referrer&quot;>
  </head>
  <body>
    <video src=&quot;http://mock.com/DIYgod/DIYgod/RSSHub&quot;></video>
  </body>
</html>
">
</iframe>
 - Made with love by RSSHub(https://github.com/DIYgod/RSSHub)`,
        },
    },
};

const testAntiHotlink = async (path, expectObj, query) => {
    server = require('../../lib/index');
    const request = supertest(server);

    let queryStr;
    if (query) {
        queryStr = typeof query === 'string' ? query : querystring.stringify(query);
    }
    path = path + (queryStr ? `?${queryStr}` : '');

    const response = await request.get(path);
    const parsed = await parser.parseString(response.text);
    expect({
        items: parsed.items.slice(0, expectObj.items.length).map((i) => i.content),
        desc: parsed.description,
    }).toStrictEqual(expectObj);

    return parsed;
};

const expectImgOrigin = (query) => testAntiHotlink('/test/complicated', expects.complicated.origin, query);
const expectImgProcessed = (query) => testAntiHotlink('/test/complicated', expects.complicated.processed, query);
const expectImgUrlencoded = (query) => testAntiHotlink('/test/complicated', expects.complicated.urlencoded, query);
const expectMultimediaOrigin = (query) => testAntiHotlink('/test/multimedia', expects.multimedia.origin, query);
const expectMultimediaRelayed = (query) => testAntiHotlink('/test/multimedia', expects.multimedia.relayed, query);
const expectMultimediaPartlyRelayed = (query) => testAntiHotlink('/test/multimedia', expects.multimedia.partlyRelayed, query);
const expectMultimediaWrappedInIframe = (query) => testAntiHotlink('/test/multimedia', expects.multimedia.wrappedInIframe, query);

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

    it('multimedia-wrapped-in-iframe-experimental', async () => {
        await expectMultimediaWrappedInIframe({ wrap_multimedia_in_iframe: '1' });
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
        server = require('../../lib/index');
        const request = supertest(server);
        const response = await request.get('/test/complicated');
        expect(response.text).toContain('Error: Invalid URL property: createObjectURL');
    });
});
