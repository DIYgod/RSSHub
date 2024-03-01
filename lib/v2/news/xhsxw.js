const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 100;

    const rootUrl = 'http://www.news.cn';
    const currentUrl = new URL('xhsxw.htm', rootUrl).href;

    const { data: currentResponse } = await got(currentUrl);

    const $ = cheerio.load(currentResponse);

    const id = $('ul.wz-list')
        .prop('data')
        .replace(/datasource:/, '');

    const apiUrl = new URL(`ds_${id}.json`, rootUrl).href;

    const {
        data: { datasource: response },
    } = await got(apiUrl);

    let items = response.slice(0, limit).map((item) => ({
        title: item.title,
        link: new URL(item.publishUrl, rootUrl).href,
        description: art(path.join(__dirname, 'templates/description.art'), {
            images:
                item.shareImages?.map((i) => ({
                    src: i.imageUrl,
                    alt: item.title,
                })) ?? undefined,
            intro: item.summary,
        }),
        author: item.author,
        category: item.keywords.split(/-|,/),
        guid: `news-${item.contentId}`,
        pubDate: timezone(parseDate(item.publishTime), +8),
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const { data: detailResponse } = await got(item.link);

                    const content = cheerio.load(detailResponse);

                    item.description += art(path.join(__dirname, 'templates/description.art'), {
                        description: content('#detailContent').html(),
                    });
                } catch {
                    // no-empty
                }

                return item;
            })
        )
    );

    const title = $('title').text();
    const image = new URL('20141223_xhsxw_logo_v1.png', rootUrl).href;
    const icon = new URL('favicon.ico', rootUrl).href;

    ctx.state.data = {
        item: items,
        title,
        link: currentUrl,
        description: title.split(/_/)[0],
        language: 'zh',
        image,
        icon,
        logo: icon,
        author: title.split(/_/).pop(),
        allowEmpty: true,
    };
};
