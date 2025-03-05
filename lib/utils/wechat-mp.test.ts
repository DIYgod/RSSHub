import { describe, expect, it, vi, afterEach } from 'vitest';
import { load } from 'cheerio';
import Parser from 'rss-parser';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import { exportedForTestingOnly, WeChatMpError, fetchArticle, finishArticleItem, fixArticleContent, normalizeUrl } from '@/utils/wechat-mp';
const { toggleWerror, ExtractMetadata, showTypeMapReverse } = exportedForTestingOnly;

vi.mock('@/utils/request-rewriter', () => ({ default: null }));
const { default: app } = await import('@/app');
const parser = new Parser();

afterEach(() => toggleWerror(false));

const expectedItem: {
    title: string;
    summary: string;
    author: string;
    mpName: string;
    link: string;
} = {
    title: 'title',
    summary: 'summary',
    author: 'author',
    mpName: 'mpName',
    link: '', // to be filled
};

// date from the cache will be an ISO8601 string, so we need to use this function
const compareDate = (date1, date2) => {
    date1 = typeof date1 === 'string' ? new Date(date1) : date1;
    date2 = typeof date2 === 'string' ? new Date(date2) : date2;
    return date1.getTime() === date2.getTime();
};
const genScriptHtmlStr = (script: string) => `
    <html lang="">
        <script type="text/javascript" nonce="123456789">
        ${script}
        </script>
    </html>
`;
const testFetchArticleFinishArticleItem = async (path: string, { setMpNameAsAuthor = false, skipLink = false } = {}) => {
    const ct = 1_636_626_300;
    const httpsUrl = `https://mp.weixin.qq.com/rsshub_test${path}`;
    const httpUrl = 'http' + httpsUrl.slice(5);

    const expectedDate = new Date(ct * 1000);

    const expectedItem_ = {
        ...expectedItem,
        link: httpsUrl,
    };

    const fetchArticleItem = await fetchArticle(httpUrl);
    expect(compareDate(fetchArticleItem.pubDate, expectedDate)).toBe(true);
    expect(fetchArticleItem).toMatchObject(expectedItem_);

    const ToBeFinishedArticleItem = { link: httpUrl };
    const expectedFinishedArticleItem = { ...fetchArticleItem };
    expectedFinishedArticleItem.author = setMpNameAsAuthor ? <string>expectedFinishedArticleItem.mpName : expectedFinishedArticleItem.author;
    expectedFinishedArticleItem.link = skipLink ? ToBeFinishedArticleItem.link : expectedFinishedArticleItem.link;

    const finishedArticleItem = await finishArticleItem(ToBeFinishedArticleItem, setMpNameAsAuthor, skipLink);
    expect(compareDate(finishedArticleItem.pubDate, fetchArticleItem.pubDate)).toBe(true);
    delete expectedFinishedArticleItem.pubDate;
    expect(finishedArticleItem).toMatchObject(expectedFinishedArticleItem);

    return fetchArticleItem;
};

describe('wechat-mp', () => {
    it('ExtractMetadata.common', () => {
        expect(ExtractMetadata.common(load(''))).toStrictEqual({});

        expect(
            ExtractMetadata.common(
                load(
                    genScriptHtmlStr(`
            window.fake_item_show_type = '5' || '';
            window.fake_real_item_show_type = '5' || '';
            window.fake_ct = '1713009660' || '';
        `)
                )
            )
        ).toMatchObject({});

        expect(
            ExtractMetadata.common(
                load(
                    genScriptHtmlStr(`
            window.item_show_type = '5' || '';
            window.real_item_show_type = '5' || '';
            window.ct = '1713009660' || '';
        `)
                )
            )
        ).toMatchObject({
            showType: showTypeMapReverse['5'],
            realShowType: showTypeMapReverse['5'],
            createTime: '1713009660',
        });

        expect(
            ExtractMetadata.common(
                load(
                    genScriptHtmlStr(`
            var item_show_type = "5";
            var real_item_show_type = "5";
            var ct = "1713009660";
            var msg_source_url = 'https://mp.weixin.qq.com/rsshub_test/fake';
        `)
                )
            )
        ).toMatchObject({
            showType: showTypeMapReverse['5'],
            realShowType: showTypeMapReverse['5'],
            createTime: '1713009660',
            sourceUrl: 'https://mp.weixin.qq.com/rsshub_test/fake',
        });

        expect(
            ExtractMetadata.common(
                load(
                    genScriptHtmlStr(`
            var item_show_type = "998877665544332211";
            var real_item_show_type = "112233445566778899";
            var ct = "1713009660";
        `)
                )
            )
        ).toMatchObject({
            showType: '998877665544332211',
            realShowType: '112233445566778899',
            createTime: '1713009660',
        });
    });
    it('ExtractMetadata.img', () => {
        expect(ExtractMetadata.img(load(''))).toStrictEqual({});

        expect(
            ExtractMetadata.img(
                load(
                    genScriptHtmlStr(`
            window.picture_page_info_list = [
            {
              cdn_url: 'https://mmbiz.qpic.cn/rsshub_test/fake_img_1/0?wx_fmt=jpeg',
            },
            {
              cdn_url: 'https://mmbiz.qpic.cn/rsshub_test/fake_img_2/0?wx_fmt=jpeg',
            },
            ].slice(0, 20);
        `)
                )
            )
        ).toMatchObject({
            imgUrls: ['https://mmbiz.qpic.cn/rsshub_test/fake_img_1/0?wx_fmt=jpeg', 'https://mmbiz.qpic.cn/rsshub_test/fake_img_2/0?wx_fmt=jpeg'],
        });
    });
    it('ExtractMetadata.audio', () => {
        expect(ExtractMetadata.audio(load(''))).toStrictEqual({});

        expect(
            ExtractMetadata.audio(
                load(
                    genScriptHtmlStr(`
            reportOpt = {
              voiceid: "",
              uin: "",
              biz: "",
              mid: "",
              idx: ""
            };
        `)
                )
            )
        ).toMatchObject({});

        expect(
            ExtractMetadata.audio(
                load(
                    genScriptHtmlStr(`
            window.cgiData = {
              voiceid: "rsshub_test_voiceid_1",
              duration: "6567" * 1,
            };
        `)
                )
            )
        ).toMatchObject({
            voiceId: 'rsshub_test_voiceid_1',
            duration: '6567',
        });

        expect(
            ExtractMetadata.audio(
                load(
                    genScriptHtmlStr(`
            window.cgiData = {
              voiceid: "rsshub_test_voiceid_1",
            };
        `)
                )
            )
        ).toMatchObject({
            voiceId: 'rsshub_test_voiceid_1',
            duration: null,
        });

        expect(
            ExtractMetadata.audio(
                load(
                    genScriptHtmlStr(`
            reportOpt = {
              voiceid: "",
              uin: "",
              biz: "",
              mid: "",
              idx: ""
            };
            window.cgiData = {
              voiceid: "rsshub_test_voiceid_1",
              duration: "6567" * 1,
            };
        `)
                )
            )
        ).toMatchObject({
            voiceId: 'rsshub_test_voiceid_1',
            duration: '6567',
        });
    });
    it('ExtractMetadata.location', () => {
        expect(ExtractMetadata.location(load(''))).toStrictEqual({});

        expect(
            ExtractMetadata.location(
                load(
                    genScriptHtmlStr(`
            window.ip_wording = {
              countryName: '中国',
              countryId: '156',
              provinceName: '广东',
              provinceId: '',
              cityName: '',
              cityId: ''
            };
        `)
                )
            )
        ).toMatchObject({
            countryName: '中国',
            provinceName: '广东',
            cityName: '',
        });
    });
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
        let $ = load(divHeader + htmlSection + divFooter);
        expect(fixArticleContent(htmlSection)).toBe(expectedHtmlSection);
        expect(fixArticleContent($('div#js_content.rich_media_content'))).toBe(expectedHtmlSection);

        const htmlImg = '<img alt="test" data-src="http://rsshub.test/test.jpg" src="http://rsshub.test/test.jpg">' + '<img alt="test" data-src="http://rsshub.test/test.jpg">' + '<img alt="test" src="http://rsshub.test/test.jpg">';
        const expectedHtmlImg = Array.from({ length: 3 + 1 }).join('<img alt="test" src="http://rsshub.test/test.jpg">');
        $ = load(divHeader + htmlImg + divFooter);
        expect(fixArticleContent(htmlImg)).toBe(expectedHtmlImg);
        expect(fixArticleContent($('div#js_content.rich_media_content'))).toBe(expectedHtmlImg);
        expect(fixArticleContent(htmlImg, true)).toBe(htmlImg);
        expect(fixArticleContent($('div#js_content.rich_media_content'), true)).toBe(htmlImg);

        expect(fixArticleContent('')).toBe('');
        expect(fixArticleContent()).toBe('');
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
        expect(() => normalizeUrl(notWechatMp)).toThrow('URL host must be "mp.weixin.qq.com"');
        expect(normalizeUrl(notWechatMp, true)).toBe(notWechatMp);

        const unknownSearchParam = mpArticleRoot + '?unknown=param';
        toggleWerror(false);
        expect(normalizeUrl(unknownSearchParam)).toBe(unknownSearchParam);
        toggleWerror(true);
        expect(() => normalizeUrl(unknownSearchParam)).toThrow('WarningAsError: unknown URL search parameters');

        const unknownPath = mpRoot + '/unknown/path';
        toggleWerror(false);
        expect(normalizeUrl(unknownPath)).toBe(unknownPath);
        toggleWerror(true);
        expect(() => normalizeUrl(unknownPath, true)).toThrow('WarningAsError: unknown URL path');

        const ampEscapedUrl = longUrl.replaceAll('&', '&amp;');
        expect(normalizeUrl(ampEscapedUrl)).toBe(longUrlShortened);
    });

    it('fetchArticle_&_finishArticleItem_appMsg', async () => {
        const fetchArticleItem = await testFetchArticleFinishArticleItem('/appMsg');
        const $ = load(fetchArticleItem.description);
        expect($('iframe').attr()).toMatchObject({
            src:
                'https://v.qq.com/txp/iframe/player.html?origin=https%3A%2F%2Fmp.weixin.qq.com' +
                '&containerId=js_tx_video_container_0.3863487104715233&vid=fake&width=677&height=380.8125' +
                '&autoplay=false&allowFullScreen=true&chid=17&full=true&show1080p=false&isDebugIframe=false',
            width: '677',
            height: '380.8125',
        });
        expect($('audio').attr()).toMatchObject({
            src: 'https://res.wx.qq.com/voice/getvoice?mediaid=rsshub_test',
            title: 'title',
        });
        expect($('a').attr()).toMatchObject({
            href: 'https://mp.weixin.qq.com/rsshub_test/fake',
        });
        expect(fetchArticleItem.description).toContain('description');
        expect(fetchArticleItem.description).toContain('📍发表于：中国 福建');
        expect(fetchArticleItem.description).toContain('🔗️ 阅读原文');
    });

    it('fetchArticle_&_finishArticleItem_img', async () => {
        const fetchArticleItem = await testFetchArticleFinishArticleItem('/img');
        const $ = load(fetchArticleItem.description);
        expect($.text()).toBe('summary');
        expect($('img:nth-of-type(1)').attr()).toMatchObject({
            src: 'https://mmbiz.qpic.cn/rsshub_test/fake_img_1/0?wx_fmt=jpeg',
        });
        expect($('img:nth-of-type(2)').attr()).toMatchObject({
            src: 'https://mmbiz.qpic.cn/rsshub_test/fake_img_2/0?wx_fmt=jpeg',
        });
    });

    it('fetchArticle_&_finishArticleItem_audio', async () => {
        const fetchArticleItem = await testFetchArticleFinishArticleItem('/audio');
        const $ = load(fetchArticleItem.description);
        expect($.text()).toBe('summary');
        expect($('audio').attr()).toMatchObject({
            controls: '',
            src: 'https://res.wx.qq.com/voice/getvoice?mediaid=rsshub_test_voiceid_1',
            style: 'width:100%',
            title: 'title',
        });
        expect(fetchArticleItem).toMatchObject({
            enclosure_type: 'audio/mp3',
            enclosure_url: 'https://res.wx.qq.com/voice/getvoice?mediaid=rsshub_test_voiceid_1',
            itunes_duration: '6567',
        });
    });

    it('fetchArticle_&_finishArticleItem_video', async () => {
        const fetchArticleItem = await testFetchArticleFinishArticleItem('/video');
        const $ = load(fetchArticleItem.description);
        expect($.text()).toBe('summary');
        expect($('img').attr()).toMatchObject({
            src: 'https://mmbiz.qpic.cn/rsshub_test/og_img_1/0?wx_fmt=jpeg',
        });
    });

    it('fetchArticle_&_finishArticleItem_fallback', async () => {
        const fetchArticleItem = await testFetchArticleFinishArticleItem('/fallback');
        const $ = load(fetchArticleItem.description);
        expect($.text()).toBe('summary');
        expect($('img').attr()).toMatchObject({
            src: 'https://mmbiz.qpic.cn/rsshub_test/og_img_1/0?wx_fmt=jpeg',
        });
    });

    it('finishArticleItem_param', async () => {
        await testFetchArticleFinishArticleItem('/fallback', { setMpNameAsAuthor: false, skipLink: false });
        await testFetchArticleFinishArticleItem('/fallback', { setMpNameAsAuthor: true, skipLink: false });
        await testFetchArticleFinishArticleItem('/fallback', { setMpNameAsAuthor: false, skipLink: true });
        await testFetchArticleFinishArticleItem('/fallback', { setMpNameAsAuthor: true, skipLink: true });
    });

    it('hit_waf', async () => {
        try {
            await fetchArticle('https://mp.weixin.qq.com/s/rsshub_test_hit_waf');
            expect.unreachable('Should throw an error');
        } catch (error) {
            expect(error).toBeInstanceOf(WeChatMpError);
            expect((<WeChatMpError>error).message).not.toContain('console.log');
            expect((<WeChatMpError>error).message).not.toContain('.style');
            expect((<WeChatMpError>error).message).not.toContain('Consider raise an issue');
            expect((<WeChatMpError>error).message).toContain('request blocked by WAF:');
            expect((<WeChatMpError>error).message).toContain('/mp/rsshub_test/waf');
            expect((<WeChatMpError>error).message).toContain('Title');
            expect((<WeChatMpError>error).message).toContain('环境异常');
        }
    });

    it('unknown_page', async () => {
        const unknownPageUrl = 'https://mp.weixin.qq.com/s/unknown_page';
        try {
            await fetchArticle(unknownPageUrl);
            expect.unreachable('Should throw an error');
        } catch (error) {
            expect(error).toBeInstanceOf(WeChatMpError);
            expect((<WeChatMpError>error).message).not.toContain('console.log');
            expect((<WeChatMpError>error).message).not.toContain('.style');
            expect((<WeChatMpError>error).message).toContain('Consider raise an issue');
            expect((<WeChatMpError>error).message).toContain('unknown page,');
            expect((<WeChatMpError>error).message).toContain('Title Unknown paragraph');
            expect((<WeChatMpError>error).message).toContain(unknownPageUrl);
        }
    });

    it('deleted_page', async () => {
        const deletedPageUrl = 'https://mp.weixin.qq.com/s/deleted_page';

        try {
            await fetchArticle(deletedPageUrl);
            expect.unreachable('Should throw an error');
        } catch (error) {
            expect(error).toBeInstanceOf(WeChatMpError);
            expect((<WeChatMpError>error).message).not.toContain('console.log');
            expect((<WeChatMpError>error).message).not.toContain('.style');
            expect((<WeChatMpError>error).message).not.toContain('Consider raise an issue');
            expect((<WeChatMpError>error).message).toContain('deleted by author:');
            expect((<WeChatMpError>error).message).toContain('Title 该内容已被发布者删除');
            expect((<WeChatMpError>error).message).toContain(deletedPageUrl);
        }
    });

    it('redirect', () => {
        expect(fetchArticle('https://mp.weixin.qq.com/s/rsshub_test_redirect_no_location')).rejects.toThrow('redirect without location');
        expect(fetchArticle('https://mp.weixin.qq.com/s/rsshub_test_recursive_redirect')).rejects.toThrow('too many redirects');
    });

    it('route_test', async () => {
        try {
            await app.request('/test/wechat-mp');
        } catch (error) {
            expect(error).toBeInstanceOf(InvalidParameterError);
        }

        const responseShort = await app.request('/test/wechat-mp/rsshub_test');
        const parsedShort = await parser.parseString(await responseShort.text());
        const expectedItemShort = {
            author: expectedItem.author,
            title: expectedItem.title,
            link: 'https://mp.weixin.qq.com/s/rsshub_test',
        };
        expect(parsedShort.items[0]).toMatchObject(expectedItemShort);

        const responseLong = await app.request('/test/wechat-mp/__biz=rsshub_test&mid=1&idx=1&sn=1');
        const parsedLong = await parser.parseString(await responseLong.text());
        const expectedItemLong = {
            ...expectedItemShort,
            link: 'https://mp.weixin.qq.com/s?__biz=rsshub_test&mid=1&idx=1&sn=1',
        };
        expect(parsedLong.items[0]).toMatchObject(expectedItemLong);
    });
});
