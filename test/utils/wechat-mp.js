process.env.REQUEST_TIMEOUT = '500';
const cheerio = require('cheerio');
const {
    _internal: { normalizeUrl },
    fetchArticle,
    finishArticleItem,
    fixArticleContent,
} = require('../../lib/utils/wechat-mp');
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
        const codeSection =
            '<section class="code-snippet__fix code-snippet__js">' +
            '<ul class="code-snippet__line-index code-snippet__js">' +
            '<li></li><li></li><li></li>' +
            '</ul >' +
            '<pre class="code-snippet__js">' +
            '<code><span class="code-snippet_outer">Line1 {</span></code>' +
            '<code><span class="code-snippet__keyword">Line2</span></code>' +
            '<code><span class="code-snippet_outer">Line3 }</span></code>' +
            '</pre></section>';
        const expectedCodeSection =
            '<p class="code-snippet__fix code-snippet__js">' +
            '<pre class="code-snippet__js">' +
            '<code><span class="code-snippet_outer">Line1 {</span></code>' +
            '<br>' +
            '<code><span class="code-snippet__keyword">Line2</span></code>' +
            '<br>' +
            '<code><span class="code-snippet_outer">Line3 }</span></code>' +
            '<br>' +
            '</pre></p>';
        const htmlSection =
            codeSection +
            '<section>test</section>' +
            '<section><p>test</p></section>' +
            '<section><div>test</div></section>' +
            '<section><section><section>test</section></section></section>' +
            '<div><section><p>test</p></section></div>' +
            '<p>test</p>' +
            '<div><p>test</p></div>' +
            '<script>const test = "test"</script>';
        const expectedHtmlSection =
            expectedCodeSection + '<p>test</p>' + '<div><p>test</p></div>' + '<div><div>test</div></div>' + '<div><div><p>test</p></div></div>' + '<div><div><p>test</p></div></div>' + '<p>test</p>' + '<div><p>test</p></div>';
        let $ = cheerio.load(divHeader + htmlSection + divFooter);
        expect(fixArticleContent(htmlSection)).toBe(expectedHtmlSection);
        expect(fixArticleContent($('div#js_content.rich_media_content'))).toBe(expectedHtmlSection);

        const htmlImg = '<img alt="test" data-src="http://rsshub.test/test.jpg" src="http://rsshub.test/test.jpg">' + '<img alt="test" data-src="http://rsshub.test/test.jpg">' + '<img alt="test" src="http://rsshub.test/test.jpg">';
        const expectedHtmlImg = new Array(3 + 1).join('<img alt="test" src="http://rsshub.test/test.jpg">');
        $ = cheerio.load(divHeader + htmlImg + divFooter);
        expect(fixArticleContent(htmlImg)).toBe(expectedHtmlImg);
        expect(fixArticleContent($('div#js_content.rich_media_content'))).toBe(expectedHtmlImg);
        expect(fixArticleContent(htmlImg, true)).toBe(htmlImg);
        expect(fixArticleContent($('div#js_content.rich_media_content'), true)).toBe(htmlImg);

        expect(fixArticleContent('')).toBe('');
        expect(fixArticleContent(null)).toBe('');
        expect(fixArticleContent(undefined)).toBe('');
        expect(fixArticleContent($('div#something_not_in.the_document_tree'))).toBe('');
    });

    it('normalizeUrl', () => {
        const mpRoot = 'https://mp.weixin.qq.com';
        const mpArticleRoot = mpRoot + '/s';

        const shortUrl = mpArticleRoot + '/-rwvHhqYbKGCVFeXRNknYQ';
        const shortUrlWithQueryAndHash = shortUrl + '?foo=bar#baz';
        expect(normalizeUrl(shortUrlWithQueryAndHash)).toBe(shortUrl);

        const longUrlShortened = mpArticleRoot + '?__biz=MzA4MjQxNjQzMA==' + '&mid=2768628484' + '&idx=1' + '&sn=93dcc54ce807f7793739ee2fd2377056';
        const longUrl = longUrlShortened + '&chksm=bf774d458800c453c94cae866093680e6cac6a1f02cab7e82683f82f35f7f487e2daa1dcde20' + '&scene=75' + '#wechat_redirect';
        expect(normalizeUrl(longUrl)).toBe(longUrlShortened);

        const temporaryUrlShortened =
            mpArticleRoot + '?src=11' + '&timestamp=1620536401' + '&ver=3057' + '&signature=vCDI8FQcumnNGv4ScvFP-swQRlirdQSqTfjS8m-oFzgHMkqlNM3ljzjSevcjXLC-z-n0RzzMkNt-lwKMUaskfaqFFrpYZNq4ZCKkFFGj8L*KvH780aEUBJFvWTGmMGLC';
        const temporaryUrl = temporaryUrlShortened + '&new=1#foo';
        expect(normalizeUrl(temporaryUrl)).toBe(temporaryUrlShortened);

        const somethingElse = mpRoot + '/something/else?__biz=foo&mid=bar&idx=baz&sn=qux';
        const somethingElseWithHash = somethingElse + '#foo';
        expect(normalizeUrl(somethingElseWithHash.replace('https://', 'http://'))).toBe(somethingElse);

        const notWechatMp = 'https://im.not.wechat.mp/and/an/error/is/expected';
        expect(() => normalizeUrl(notWechatMp)).toThrow();
        expect(normalizeUrl(notWechatMp, true)).toBe(notWechatMp);
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

        const expectedItem = {
            title: 'title',
            summary: 'summary',
            author: 'author',
            description: 'description',
            mpName: 'mpName',
            link: httpsUrl,
        };
        const expectedDate = new Date(ct * 1000);

        const fetchArticleItem = await fetchArticle(ctx, httpUrl);
        expect(compareDate(fetchArticleItem.pubDate, expectedDate)).toBe(true);
        delete fetchArticleItem.pubDate;
        expect(fetchArticleItem).toEqual(expectedItem);

        delete expectedItem.mpName;
        const finishedArticleItem = await finishArticleItem(ctx, { link: httpUrl });
        expect(compareDate(finishedArticleItem.pubDate, expectedDate)).toBe(true);
        delete finishedArticleItem.pubDate;
        expect(finishedArticleItem).toEqual(expectedItem);
    });
});
