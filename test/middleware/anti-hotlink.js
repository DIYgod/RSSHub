const supertest = require('supertest');
jest.mock('request-promise-native');
const Parser = require('rss-parser');
const parser = new Parser();
let server;

afterAll(() => {
    delete process.env.HOTLINK_TEMPLATE;
    delete process.env.HOTLINK_INCLUDE_PATHS;
    delete process.env.HOTLINK_EXCLUDE_PATHS;
});

afterEach(() => {
    delete process.env.HOTLINK_TEMPLATE;
    delete process.env.HOTLINK_INCLUDE_PATHS;
    delete process.env.HOTLINK_EXCLUDE_PATHS;
    jest.resetModules();
    server.close();
});

const origin1 = `<a href="https://mock.com/DIYgod/RSSHub"></a>
<img src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">

<a href="http://mock.com/DIYgod/RSSHub"></a>
<img src="https://mock.com/DIYgod/RSSHub.jpg" data-src="/DIYgod/RSSHub0.jpg" referrerpolicy="no-referrer">
<img data-src="/DIYgod/RSSHub.jpg" src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">
<img data-mock="/DIYgod/RSSHub.png" src="https://mock.com/DIYgod/RSSHub.png" referrerpolicy="no-referrer">
<img mock="/DIYgod/RSSHub.gif" src="https://mock.com/DIYgod/RSSHub.gif" referrerpolicy="no-referrer">
<img src="http://mock.com/DIYgod/DIYgod/RSSHub" referrerpolicy="no-referrer">
<img src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">`;

const processed1 = `<a href="https://mock.com/DIYgod/RSSHub"></a>
<img src="https://i3.wp.com/mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">

<a href="http://mock.com/DIYgod/RSSHub"></a>
<img src="https://i3.wp.com/mock.com/DIYgod/RSSHub.jpg" data-src="/DIYgod/RSSHub0.jpg" referrerpolicy="no-referrer">
<img data-src="/DIYgod/RSSHub.jpg" src="https://i3.wp.com/mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">
<img data-mock="/DIYgod/RSSHub.png" src="https://i3.wp.com/mock.com/DIYgod/RSSHub.png" referrerpolicy="no-referrer">
<img mock="/DIYgod/RSSHub.gif" src="https://i3.wp.com/mock.com/DIYgod/RSSHub.gif" referrerpolicy="no-referrer">
<img src="https://i3.wp.com/mock.com/DIYgod/DIYgod/RSSHub" referrerpolicy="no-referrer">
<img src="https://i3.wp.com/mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">`;

const origin2 = `<a href="https://mock.com/DIYgod/RSSHub"></a>
<img src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">`;

const processed2 = `<a href="https://mock.com/DIYgod/RSSHub"></a>
<img src="https://i3.wp.com/mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">`;

const oriRouteDesc = '<img src="http://mock.com/DIYgod/DIYgod/RSSHub"> - Made with love by RSSHub(https://github.com/DIYgod/RSSHub)';

const proRouteDesc = '<img src="https://i3.wp.com/mock.com/DIYgod/DIYgod/RSSHub"> - Made with love by RSSHub(https://github.com/DIYgod/RSSHub)';

const testAntiHotlink = async (expect1, expect2, expectRouteDesc) => {
    server = require('../../lib/index');
    const request = supertest(server);

    const response = await request.get('/test/complicated');
    const parsed = await parser.parseString(response.text);
    expect(parsed.items[0].content).toBe(expect1);
    expect(parsed.items[1].content).toBe(expect2);
    expect(parsed.description).toBe(expectRouteDesc);
    return parsed;
};

const expectOrigin = async () => await testAntiHotlink(origin1, origin2, oriRouteDesc);

const expectProcessed = async () => await testAntiHotlink(processed1, processed2, proRouteDesc);

describe('anti-hotlink', () => {
    // First-time require is really, really slow.
    // If someone merely runs this test unit instead of the whole suite and this stage does not exist,
    // the next one will sometimes time out, so we need to firstly require it once.
    it('server-require', () => {
        server = require('../../lib/index');
    });

    it('template', async () => {
        process.env.HOTLINK_TEMPLATE = 'https://i3.wp.com/${host}${pathname}';
        await expectProcessed();
    });

    it('url', async () => {
        process.env.HOTLINK_TEMPLATE = '${protocol}//${host}${pathname}';
        await expectOrigin();
    });

    it('no-template', async () => {
        process.env.HOTLINK_TEMPLATE = '';
        await expectOrigin();
    });

    it('include-paths-partial-matched', async () => {
        process.env.HOTLINK_TEMPLATE = 'https://i3.wp.com/${host}${pathname}';
        process.env.HOTLINK_INCLUDE_PATHS = '/test';
        await expectProcessed();
    });

    it('include-paths-fully-matched', async () => {
        process.env.HOTLINK_TEMPLATE = 'https://i3.wp.com/${host}${pathname}';
        process.env.HOTLINK_INCLUDE_PATHS = '/test/complicated';
        await expectProcessed();
    });

    it('include-paths-unmatched', async () => {
        process.env.HOTLINK_TEMPLATE = 'https://i3.wp.com/${host}${pathname}';
        process.env.HOTLINK_INCLUDE_PATHS = '/t';
        await expectOrigin();
    });

    it('exclude-paths-partial-matched', async () => {
        process.env.HOTLINK_TEMPLATE = 'https://i3.wp.com/${host}${pathname}';
        process.env.HOTLINK_EXCLUDE_PATHS = '/test';
        await expectOrigin();
    });

    it('exclude-paths-fully-matched', async () => {
        process.env.HOTLINK_TEMPLATE = 'https://i3.wp.com/${host}${pathname}';
        process.env.HOTLINK_EXCLUDE_PATHS = '/test/complicated';
        await expectOrigin();
    });

    it('exclude-paths-unmatched', async () => {
        process.env.HOTLINK_TEMPLATE = 'https://i3.wp.com/${host}${pathname}';
        process.env.HOTLINK_EXCLUDE_PATHS = '/t';
        await expectProcessed();
    });

    it('include-exclude-paths-mixed-filtered-out', async () => {
        process.env.HOTLINK_TEMPLATE = 'https://i3.wp.com/${host}${pathname}';
        process.env.HOTLINK_INCLUDE_PATHS = '/test';
        process.env.HOTLINK_EXCLUDE_PATHS = '/test/complicated';
        await expectOrigin();
    });

    it('include-exclude-paths-mixed-unfiltered-out', async () => {
        process.env.HOTLINK_TEMPLATE = 'https://i3.wp.com/${host}${pathname}';
        process.env.HOTLINK_INCLUDE_PATHS = '/test';
        process.env.HOTLINK_EXCLUDE_PATHS = '/test/c';
        await expectProcessed();
    });
});
