const supertest = require('supertest');
jest.mock('request-promise-native');
const server = require('../../lib/index');
const request = supertest(server);
const Parser = require('rss-parser');
const parser = new Parser();

beforeAll(() => {
    process.env.HOTLINK_TEMPLATE = '';
});

afterAll(() => {
    delete process.env.HOTLINK_TEMPLATE;
});

describe('anti-hotlink', () => {
    it('template', async () => {
        process.env.HOTLINK_TEMPLATE = 'https://i3.wp.com/${noProtocol}';
        const response = await request.get('/test/complicated');
        const parsed = await parser.parseString(response.text);
        expect(parsed.items[0].content).toBe(
            `<a href="https://mock.com/DIYgod/RSSHub"/> <img src="https://i3.wp.com/mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer"> <a href="http://mock.com/DIYgod/RSSHub"/> <img src="https://i3.wp.com/mock.com/DIYgod/RSSHub.jpg" data-src="/DIYgod/RSSHub0.jpg" referrerpolicy="no-referrer"> <img data-src="/DIYgod/RSSHub.jpg" src="https://i3.wp.com/mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer"> <img data-mock="/DIYgod/RSSHub.png" src="https://i3.wp.com/mock.com/DIYgod/RSSHub.png" referrerpolicy="no-referrer"> <img mock="/DIYgod/RSSHub.gif" src="https://i3.wp.com/mock.com/DIYgod/RSSHub.gif" referrerpolicy="no-referrer"> <img src="https://i3.wp.com/mock.com/DIYgod/DIYgod/RSSHub" referrerpolicy="no-referrer"> <img src="https://i3.wp.com/mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer"/></img></img></img></img></img></img>`
        );
        expect(parsed.items[1].content).toBe(`<a href="https://mock.com/DIYgod/RSSHub"/> <img src="https://i3.wp.com/mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer"/>`);
    });
    it('url', async () => {
        process.env.HOTLINK_TEMPLATE = '${url.protocol}//${url.host}${url.pathname}';
        const response = await request.get('/test/complicated');
        const parsed = await parser.parseString(response.text);
        expect(parsed.items[0].content).toBe(
            `<a href="https://mock.com/DIYgod/RSSHub"/> <img src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer"> <a href="http://mock.com/DIYgod/RSSHub"/> <img src="https://mock.com/DIYgod/RSSHub.jpg" data-src="/DIYgod/RSSHub0.jpg" referrerpolicy="no-referrer"> <img data-src="/DIYgod/RSSHub.jpg" src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer"> <img data-mock="/DIYgod/RSSHub.png" src="https://mock.com/DIYgod/RSSHub.png" referrerpolicy="no-referrer"> <img mock="/DIYgod/RSSHub.gif" src="https://mock.com/DIYgod/RSSHub.gif" referrerpolicy="no-referrer"> <img src="http://mock.com/DIYgod/DIYgod/RSSHub" referrerpolicy="no-referrer"> <img src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer"/></img></img></img></img></img></img>`
        );
        expect(parsed.items[1].content).toBe(`<a href="https://mock.com/DIYgod/RSSHub"/> <img src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer"/>`);
    });
    it('no-template', async () => {
        process.env.HOTLINK_TEMPLATE = '';
        const response = await request.get('/test/complicated');
        const parsed = await parser.parseString(response.text);
        expect(parsed.items[0].content).toBe(
            `<a href="https://mock.com/DIYgod/RSSHub"></a> <img src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer"> <a href="http://mock.com/DIYgod/RSSHub"></a> <img src="https://mock.com/DIYgod/RSSHub.jpg" data-src="/DIYgod/RSSHub0.jpg" referrerpolicy="no-referrer"> <img data-src="/DIYgod/RSSHub.jpg" src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer"> <img data-mock="/DIYgod/RSSHub.png" src="https://mock.com/DIYgod/RSSHub.png" referrerpolicy="no-referrer"> <img mock="/DIYgod/RSSHub.gif" src="https://mock.com/DIYgod/RSSHub.gif" referrerpolicy="no-referrer"> <img src="http://mock.com/DIYgod/DIYgod/RSSHub" referrerpolicy="no-referrer"> <img src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">`
        );
        expect(parsed.items[1].content).toBe(`<a href="https://mock.com/DIYgod/RSSHub"></a> <img src="https://mock.com/DIYgod/RSSHub.jpg" referrerpolicy="no-referrer">`);
    });
});
