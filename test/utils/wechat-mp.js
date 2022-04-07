process.env.REQUEST_TIMEOUT = '500';
const cheerio = require('cheerio');
const wechatMp = require('../../lib/utils/wechat-mp');
const nock = require('nock');
const ctx = require('../../lib/app').context;

afterAll(() => {
    delete process.env.REQUEST_TIMEOUT;
});

// date from the cache will be an ISO8601 string, so we need to use this function
const compareDate = (date1, date2) => {
    date1 = typeof date1 === 'string' ? new Date(date1) : date1;
    date2 = typeof date2 === 'string' ? new Date(date2) : date2;
    return date1.getTime() === date2.getTime();
};

describe('wechat-mp', () => {
    it('fixArticleContent', () => {
        const divHeader = '<div class="rich_media_content " id="js_content">';
        const divFooter = '</div>';

        const htmlSection =
            '<section>test</section>' +
            '<section><p>test</p></section>' +
            '<section><div>test</div></section>' +
            '<section><section><section>test</section></section></section>' +
            '<div><section><p>test</p></section></div>' +
            '<p>test</p>' +
            '<div><p>test</p></div>' +
            '<script>const test = "test"</script>';
        const expectedHtmlSection = '<p>test</p>' + '<div><p>test</p></div>' + '<div><div>test</div></div>' + '<div><div><p>test</p></div></div>' + '<div><div><p>test</p></div></div>' + '<p>test</p>' + '<div><p>test</p></div>';
        let $ = cheerio.load(divHeader + htmlSection + divFooter);
        expect(wechatMp.fixArticleContent(htmlSection)).toBe(expectedHtmlSection);
        expect(wechatMp.fixArticleContent($('div#js_content.rich_media_content'))).toBe(expectedHtmlSection);

        const htmlImg = '<img alt="test" data-src="http://rsshub.test/test.jpg" src="http://rsshub.test/test.jpg">' + '<img alt="test" data-src="http://rsshub.test/test.jpg">' + '<img alt="test" src="http://rsshub.test/test.jpg">';
        const expectedHtmlImg = new Array(3 + 1).join('<img alt="test" src="http://rsshub.test/test.jpg">');
        $ = cheerio.load(divHeader + htmlImg + divFooter);
        expect(wechatMp.fixArticleContent(htmlImg)).toBe(expectedHtmlImg);
        expect(wechatMp.fixArticleContent($('div#js_content.rich_media_content'))).toBe(expectedHtmlImg);
        expect(wechatMp.fixArticleContent(htmlImg, true)).toBe(htmlImg);
        expect(wechatMp.fixArticleContent($('div#js_content.rich_media_content'), true)).toBe(htmlImg);

        expect(wechatMp.fixArticleContent('')).toBe('');
        expect(wechatMp.fixArticleContent(null)).toBe('');
        expect(wechatMp.fixArticleContent(undefined)).toBe('');
        expect(wechatMp.fixArticleContent($('div#something_not_in.the_document_tree'))).toBe('');
    });

    it('fetchArticle_&_finishArticleItem', async () => {
        const ct = 1636626300;
        const exampleMpArticlePage =
            '\n' +
            '<meta name="description" content="summary" />\n' +
            '<meta name="author" content="author" />\n' +
            '<meta property="og:title" content="title" />\n' +
            '<meta property="twitter:card" content="summary" />\n' +
            '<div class="rich_media_content" id="js_content" style="visibility: hidden;">description</div>\n' +
            '<div class="profile_inner"><strong class="profile_nickname">mpName</strong></div>\n' +
            '<script type="text/javascript" nonce="000000000">\n' +
            'var appmsg_type = "9";\n' +
            `var ct = "${ct}";\n` +
            '</script>';

        nock('https://mp.weixin.qq.com')
            .get('/rsshub_test/wechatMp_fetchArticle')
            .reply(() => [200, exampleMpArticlePage]);
        const httpsUrl = 'https://mp.weixin.qq.com/rsshub_test/wechatMp_fetchArticle';
        const httpUrl = httpsUrl.replace(/^https:\/\//, 'http://');

        let _ret;
        try {
            _ret = await wechatMp.fetchArticle(ctx, 'https://im.not.wechat.mp/and/an/error/is/expected');
        } catch (e) {
            expect(e.name).toBe('Error');
        }

        expect(_ret).toBeUndefined();

        const expectedItem = {
            title: 'title',
            summary: 'summary',
            author: 'author',
            description: 'description',
            mpName: 'mpName',
            link: httpsUrl,
        };
        const expectedDate = new Date(ct * 1000);

        const fetchArticleItem = await wechatMp.fetchArticle(ctx, httpUrl);
        expect(compareDate(fetchArticleItem.pubDate, expectedDate)).toBe(true);
        delete fetchArticleItem.pubDate;
        expect(fetchArticleItem).toEqual(expectedItem);

        delete expectedItem.mpName;
        const finishArticleItem = await wechatMp.finishArticleItem(ctx, { link: httpUrl });
        expect(compareDate(finishArticleItem.pubDate, expectedDate)).toBe(true);
        delete finishArticleItem.pubDate;
        expect(finishArticleItem).toEqual(expectedItem);
    });
});
