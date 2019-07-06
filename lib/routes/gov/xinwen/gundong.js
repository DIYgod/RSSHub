const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = `http://www.gov.cn/xinwen/gundong.htm`;
    const listData = await got.get(link);
    const $list = cheerio.load(listData.data);

    ctx.state.data = {
        title: '中国政府网 - 滚动新闻',
        link,
        item: await Promise.all(
            $list('.news_box .list li:not(.line)')
                .slice(1, 12)
                .map(async (_, el) => {
                    const $el = $list(el);
                    const $a = $el.find('h4 a');
                    const href = $a.attr('href');
                    const key = `gov_gundong: ${href}`;
                    let description;
                    let dataEncode;
                    let dataDecode;
                    let urlSplit;
                    const value = await ctx.cache.get(key);

                    if (value) {
                        description = value;
                    } else {
                        const contentUrl = href.startsWith('/') ? `http://www.gov.cn${href}` : href;
                        const contentData = await got.get(contentUrl);
                        const $content = cheerio.load(contentData.data);
                        const regImg = /(img src=")(.*)(".*)/g;
                        const regUrl = /(http.*\/)(content.*)/;
                        if (contentData.data.indexOf('UCAP-CONTENT') !== -1) {
                            dataEncode = $content('#UCAP-CONTENT').html();
                        } else {
                            dataEncode = $content('body').html();
                        }
                        dataDecode = unescape(dataEncode.replace(/&#x/g, '%u').replace(/;/g, ''));
                        urlSplit = contentUrl.replace(regUrl, '$1');
                        description = dataDecode.replace(regImg, '$1' + urlSplit + '$2' + '$3');
                        ctx.cache.set(key, description);
                    }

                    return {
                        title: $a.text(),
                        description,
                        link: $a.attr('href'),
                        pubDate: new Date($el.find('.date').text()).toUTCString(),
                    };
                })
                .get()
        ),
    };
};
