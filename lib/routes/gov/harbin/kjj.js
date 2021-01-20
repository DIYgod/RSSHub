const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const baseUrl = 'http://xxgk.harbin.gov.cn';

module.exports = async (ctx) => {
    const response = await got({
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        method: 'post',
        url: `${baseUrl}/module/xxgk/search.jsp?infotypeId=&vc_title=&vc_number=&area=002276772`,
        body: 'infotypeId=0&jdid=2&divid=div11565&vc_title=&vc_number=&currpage=&vc_filenumber=&vc_all=&texttype=&fbtime=&infotypeId=&vc_title=&vc_number=&area=002276772',
    });
    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.tr_main_value_odd, .tr_main_value_even');
    let items = list.map((_, e) => ({ title: $('a', e).attr('title'), link: $('a', e).attr('href'), pubDate: $('td:nth-child(3)', e).text() })).get();
    items = await Promise.all(
        items.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const result = await got({ method: 'get', url: item.link });
                    const content = cheerio.load(result.data);
                    item.description = content('.bt_content')
                        .html()
                        .replace(/src="\//g, `src="${url.resolve(baseUrl, '.')}`)
                        .replace(/href="\//g, `href="${url.resolve(baseUrl, '.')}`)
                        .trim();
                    return item;
                })
        )
    );

    ctx.state.data = {
        title: '哈尔滨市科技局',
        link: `${baseUrl}/col/col11565/index.html`,
        item: items,
    };
};
