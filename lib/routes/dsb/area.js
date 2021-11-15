import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        area
    } = ctx.params;
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
            newsUrls.map((url) =>
                ctx.cache.tryGet(url, async () => {
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
