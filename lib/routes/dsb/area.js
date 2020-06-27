const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const area = ctx.params.area;
    const host = 'www.dsb.cn';
    const areaUrl = `http://${host}/${area}`;
    const areaResp = await got(areaUrl);
    const $ = cheerio.load(areaResp.data);
    const areaName = $('.new-list-title').text();
    const newsUrls = $('ul.new-list-cons > li > a')
        .map((i, e) => $(e).attr('href'))
        .get();

    ctx.state.data = {
        title: `电商报 - ${areaName}`,
        link: areaUrl,
        item: await Promise.all(
            newsUrls.map(
                async (url) =>
                    await ctx.cache.tryGet(url, async () => {
                        const newsResp = await got(url);
                        const $ = cheerio.load(newsResp.data);
                        return {
                            title: $('.new-content > h2').text(),
                            link: url,
                            pubDate: $('.new-content-info > span:nth-child(3)').text(),
                            description: $('div.new-content-con').html(),
                        };
                    })
            )
        ),
    };
};
