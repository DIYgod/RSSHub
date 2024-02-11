const got = require('@/utils/got');
const cheerio = require('cheerio');
const rootUrl = 'https://www.macfk.com';

module.exports = async (ctx) => {
    const { category = 'app' } = ctx.params;

    const url = `${rootUrl}/${category}`;

    const response = await got(url);
    const $ = cheerio.load(response.data);
    const list = $('#post-list > ul > li')
        .map((_, item) => ({
            title: $(item).find('p.title.active').text(),
            link: new URL($(item).find('div > a').attr('href'), rootUrl).href,
            pubDate: $(item).find('span:nth-child(1) > time').attr('datetime'),
            description: '',
            category: $(item).find('div > a > div.con > div.arm-type > span').text(),
        }))
        .get();
/*
        // net::ERR_CONNECTION_CLOSED 可能触发反爬了？
        const items = await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got(item.link);
                    const content = cheerio.load(detailResponse.data);
                    item.description = content('#primary-home > article > div.entry-content').text();
                    const regex = /下载权限查看[^]*今日剩余次/g;
                    item.description = item.description.replaceAll(regex, '');
                    item.description = item.description.replace('/&nbsp;/g', ' ');

                    // 休息0.5秒，防止被封
                    await new Promise((resolve) => setTimeout(resolve, 500));

                    return item;
                })
            )
        );
*/
    ctx.state.data = {
        title: 'MacFK - 最近更新',
        link: url,
        item: list,
    };
};
