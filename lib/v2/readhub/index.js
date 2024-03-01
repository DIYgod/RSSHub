const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const path = require('path');

const { rootUrl, apiTopicUrl, art, processItems } = require('./util');

module.exports = async (ctx) => {
    const { category = '' } = ctx.params;
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 30;

    const currentUrl = new URL(category ?? '', rootUrl).href;

    const { data: currentResponse } = await got(currentUrl);

    const type = currentResponse.match(/\[\\"type\\",\\"(\d+)\\",\\"d\\"]/)?.[1] ?? '1';

    const { data: response } = await got(apiTopicUrl, {
        searchParams: {
            type,
            page: 1,
            size: limit,
        },
    });

    let items = response.data.items.slice(0, limit).map((item) => ({
        title: item.title,
        link: item.url ?? new URL(`topic/${item.uid}`, rootUrl).href,
        description: art(path.join(__dirname, 'templates/description.art'), {
            description: item.summary,
            news: item.newsAggList,
            timeline: item.timeline,
        }),
        author: item.siteNameDisplay,
        category: [...(item.entityList.map((c) => c.name) ?? []), ...(item.tagList.map((c) => c.name) ?? [])],
        guid: item.uid,
        pubDate: parseDate(item.publishDate),
    }));

    items = await processItems(items, ctx.cache.tryGet);

    const $ = cheerio.load(currentResponse);

    const author = $('meta[property="og:site_name"]').prop('content');
    const subtitle = $(`a[data-path="/${category}"]`).text();
    const image = $('link[rel="preload"][as="image"]').prop('href');
    const icon = $('meta[property="og:image"]').prop('content');

    ctx.state.data = {
        item: items,
        title: `${author} - ${subtitle}`,
        link: currentUrl,
        description: $('meta[property="og:description"]').prop('content'),
        language: 'zh',
        image,
        icon,
        logo: icon,
        subtitle,
        author,
        allowEmpty: true,
    };
};
