const supertest = require('supertest');
jest.mock('request-promise-native');
const Parser = require('rss-parser');
const parser = new Parser();
let server;

afterAll(() => {
    delete process.env.HOTLINK_TEMPLATE;
});

afterEach(() => {
    delete process.env.HOTLINK_TEMPLATE;
    jest.resetModules();
    server.close();
});

describe('anti-hotlink', () => {
    // First-time require is really, really slow.
    // If someone merely runs this test unit instead of the whole suite and this stage does not exist,
    // the next one will sometimes time out, so we need to firstly require it once.
    it('server-require', () => {
        server = require('../../lib/index');
    });

    it('template', async () => {
        process.env.HOTLINK_TEMPLATE = 'https://i3.wp.com/${host}${pathname}';
        server = require('../../lib/index');
        const request = supertest(server);

        const response = await request.get('/test/complicated');
        const parsed = await parser.parseString(response.text);
        expect(parsed.items[0].content).toBe(
            `<a href="https://mock.com/DIYgod/RSSHub"></a>
<img src="https://i3.wp.com/mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">

<a href="http://mock.com/DIYgod/RSSHub"></a>
<img src="https://i3.wp.com/mock.com/DIYgod/RSSHub.jpg" data-src="/DIYgod/RSSHub0.jpg" referrerpolicy="no-referrer">
<img data-src="/DIYgod/RSSHub.jpg" src="https://i3.wp.com/mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">
<img data-mock="/DIYgod/RSSHub.png" src="https://i3.wp.com/mock.com/DIYgod/RSSHub.png" referrerpolicy="no-referrer">
<img mock="/DIYgod/RSSHub.gif" src="https://i3.wp.com/mock.com/DIYgod/RSSHub.gif" referrerpolicy="no-referrer">
<img src="https://i3.wp.com/mock.com/DIYgod/DIYgod/RSSHub" referrerpolicy="no-referrer">
<img src="https://i3.wp.com/mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">`
        );
        expect(parsed.items[1].content).toBe(`<a href="https://mock.com/DIYgod/RSSHub"></a>
<img src="https://i3.wp.com/mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">`);
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

    const origin2 = `<a href="https://mock.com/DIYgod/RSSHub"></a>
<img src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">`;

    const testOrigin = async () => {
        server = require('../../lib/index');
        const request = supertest(server);

        const response = await request.get('/test/complicated');
        const parsed = await parser.parseString(response.text);
        expect(parsed.items[0].content).toBe(origin1);
        expect(parsed.items[1].content).toBe(origin2);
    };

    it('url', async () => {
        process.env.HOTLINK_TEMPLATE = '${protocol}//${host}${pathname}';
        await testOrigin();
    });

    it('no-template', async () => {
        process.env.HOTLINK_TEMPLATE = '';
        await testOrigin();
    });
});
