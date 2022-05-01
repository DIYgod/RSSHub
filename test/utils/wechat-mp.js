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
    it('fixArticleContent', async () => {
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
        expect(await fixArticleContent(htmlSection)).toBe(expectedHtmlSection);
        expect(await fixArticleContent($('div#js_content.rich_media_content'))).toBe(expectedHtmlSection);

        const htmlImg = '<img alt="test" data-src="http://rsshub.test/test.jpg" src="http://rsshub.test/test.jpg">' + '<img alt="test" data-src="http://rsshub.test/test.jpg">' + '<img alt="test" src="http://rsshub.test/test.jpg">';
        const expectedHtmlImg = new Array(3 + 1).join('<img alt="test" src="http://rsshub.test/test.jpg">');
        $ = cheerio.load(divHeader + htmlImg + divFooter);
        expect(await fixArticleContent(htmlImg)).toBe(expectedHtmlImg);
        expect(await fixArticleContent($('div#js_content.rich_media_content'))).toBe(expectedHtmlImg);
        expect(await fixArticleContent(htmlImg, true)).toBe(htmlImg);
        expect(await fixArticleContent($('div#js_content.rich_media_content'), true)).toBe(htmlImg);

        const htmlIframe = `<iframe data-ratio="1.7" data-w="864" data-src="https://v.qq.com/iframe/preview.html?vid=abcdefg"></iframe>`;
        const expectedHtmlIframe = `<iframe data-ratio="1.7" data-w="864" src="https://v.qq.com/txp/iframe/player.html?origin=https%3A%2F%2Fmp.weixin.qq.com&amp;containerId=js_tx_video_container_0.3863487104715233&amp;vid=abcdefg&amp;width=677&amp;height=380.8125&amp;autoplay=false&amp;allowFullScreen=true&amp;chid=17&amp;full=true&amp;show1080p=false&amp;isDebugIframe=false" width="677" height="398.2352941176471"></iframe>`;
        $ = cheerio.load(divHeader + htmlIframe + divFooter);
        expect(await fixArticleContent(htmlIframe)).toBe(expectedHtmlIframe);
        expect(await fixArticleContent($('div#js_content.rich_media_content'))).toBe(expectedHtmlIframe);

        const htmlMpvoice = `<mpvoice name="Voice title" play_length="1000" voice_encode_fileid="mpVoiceId"></mpvoice>`;
        const expectedHtmlMpvoice = `<mpvoice name="Voice title" play_length="1000" voice_encode_fileid="mpVoiceId"><audio controls="controls" preload="auto" duration="1000" style="width:100%" src="https://res.wx.qq.com/voice/getvoice?mediaid=mpVoiceId" title="Voice title"></audio></mpvoice>`;
        $ = cheerio.load(divHeader + htmlMpvoice + divFooter);
        expect(await fixArticleContent(htmlMpvoice)).toBe(expectedHtmlMpvoice);
        expect(await fixArticleContent($('div#js_content.rich_media_content'))).toBe(expectedHtmlMpvoice);

        const htmlJSAudioDesc = `<p id="js_audio_desc"><script>
              document.getElementById('js_audio_desc').innerHTML = 'voice desc line 1\\x0d\\x0avoice desc line 2\\x0d\\x0avoice desc line 3'.replace(/\r/g, '');
            </script></p>`;
        const expectedJSAudioDesc = `<p id="js_audio_desc">voice desc line 1<br>voice desc line 2<br>voice desc line 3</p>`;
        $ = cheerio.load(divHeader + htmlJSAudioDesc + divFooter);
        expect(await fixArticleContent(htmlJSAudioDesc)).toBe(expectedJSAudioDesc);
        expect(await fixArticleContent($('div#js_content.rich_media_content'))).toBe(expectedJSAudioDesc);

        const htmlSingleVoice = `<div id="voice_parent"></div>`;
        const singleVoiceInfo = {
            voiceId: 'mpVoiceId',
            name: 'Voice title',
            duration: '1000',
        };
        const expectedSingleVoice = `<div id="voice_parent"><audio controls="controls" preload="auto" duration="1000" style="width:100%" src="https://res.wx.qq.com/voice/getvoice?mediaid=mpVoiceId" title="Voice title"></audio></div>`;

        $ = cheerio.load(divHeader + htmlSingleVoice + divFooter);
        expect(await fixArticleContent(htmlSingleVoice, false, singleVoiceInfo)).toBe(expectedSingleVoice);

        expect(await fixArticleContent('')).toBe('');
        expect(await fixArticleContent(null)).toBe('');
        expect(await fixArticleContent(undefined)).toBe('');
        expect(await fixArticleContent($('div#something_not_in.the_document_tree'))).toBe('');
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
            '</script>\n' +
            `<script type="text/javascript">
                hd_head_img = xml ? getXmlValue('hd_head_img.DATA') || '' : 'http://wx.qlogo.cn/mmhead/head_image_example/0' || '';
                window.title = "Voice title";
                voice = {duration : "1000"*1,}
                voiceList={"voice_in_appmsg":[{"voice_id":"mpVoiceId","sn":"1234567890","voice_md5":"1234567890"}]};
            </script>`;

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
            headImage: 'http://wx.qlogo.cn/mmhead/head_image_example/0',
            voiceInfo: {
                voiceId: 'mpVoiceId',
                name: 'Voice title',
                duration: '1000',
            },
        };

        const expectedFinishedItem = {
            title: 'title',
            summary: 'summary',
            author: 'author',
            description: 'description',
            link: httpsUrl,
            headImage: 'http://wx.qlogo.cn/mmhead/head_image_example/0',
            enclosure_type: 'audio/mp3',
            enclosure_url: 'https://res.wx.qq.com/voice/getvoice?mediaid=mpVoiceId',
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
        expect(finishedArticleItem).toEqual(expectedFinishedItem);
    });
});
