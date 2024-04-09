const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const rootURL = 'http://jwch.usts.edu.cn/index';

module.exports = async (ctx) => {
    const type = ctx.params.type ?? 'jwdt';
    const url = `${rootURL}/${type}.htm`;
    const response = await got(url);

    const $ = cheerio.load(response.data);
    const title = $('div.mainWrap.cleafix > div > div.right.fr > div.local.fl > h3').text();
    const list = $('div.list > ul > li')
        .map((_index, item) => ({
            title: $(item).find('a').text(),
            link: new URL($(item).find('a').attr('href'), rootURL).href,
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = cheerio.load(detailResponse.data);

                let author = null;
                let pubDate = null;
                content('div.content-title.fl > i')
                    .text()
                    .split('  ')
                    .forEach((item) => {
                        if (item.includes('作者：')) {
                            author = item.split('：')[1];
                        }
                        if (item.includes('时间：')) {
                            pubDate = item.split('：')[1];
                        }
                    });

                item.description = content('div#vsb_content').html();
                item.author = author;
                item.pubDate = timezone(parseDate(pubDate), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `苏州科技大学 教务处 - ${title}`,
        link: url,
        item: items,
    };
};
