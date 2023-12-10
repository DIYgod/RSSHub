const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const dayjs = require('dayjs');

module.exports = async (ctx) => {
    const { category } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 20;

    const domain = 'readhub.cn';
    const rootUrl = `https://${domain}`;
    const apiRootUrl = `https://api.${domain}`;
    const currentUrl = new URL(category ?? '', rootUrl).href;

    const isCategory = !category || category === 'daily';

    const formatDate = (date, format) => dayjs(date).format(format);
    const toTopicUrl = (id) => new URL(`topic/${id}`, rootUrl).href;

    art.defaults.imports = {
        ...art.defaults.imports,
        ...{
            formatDate,
            toTopicUrl,
        },
    };

    const { data: currentResponse } = await got(currentUrl);

    const buildId = currentResponse.match(/"buildId":"(\w+)"/)[1];

    const apiUrl = new URL(category ? (category === 'daily' ? `_next/data/${buildId}/daily.json` : 'news/list') : 'topic/list', category === 'daily' ? rootUrl : apiRootUrl).href;

    const { data: response } = await got(apiUrl, {
        searchParams: {
            ...(isCategory
                ? {}
                : {
                      type: currentResponse.match(/"query":\{"type":"(\d+)"\}/)[1],
                  }),
            ...{
                page: 1,
                size: limit,
            },
        },
    });

    let items = (response.data?.items ?? response.pageProps.daily).slice(0, limit).map((item) => ({
        title: item.title,
        link: item.url ?? new URL(`topic/${item.uid}`, rootUrl).href,
        description: art(path.join(__dirname, 'templates/description.art'), {
            description: item.summary,
            news: item.newsAggList,
            timeline: item.timeline,
        }),
        author: item.siteNameDisplay,
        category: item.tagList?.map((c) => c.name) ?? [],
        guid: isCategory ? item.uid : `readhub-${item.guid}`,
        pubDate: timezone(parseDate(item.publishDate), +8),
    }));

    if (isCategory) {
        items = await Promise.all(
            items.map((item) =>
                ctx.cache.tryGet(`readhub-${item.guid}`, async () => {
                    const { data: detailResponse } = await got(new URL(`_next/data/${buildId}/topic/${item.guid}.json`, rootUrl).href);

                    const data = detailResponse.pageProps.topic;

                    item.title = data.title;
                    item.link = data.url ?? new URL(`topic/${data.uid}`, rootUrl).href;
                    item.description = art(path.join(__dirname, 'templates/description.art'), {
                        description: data.summary,
                        news: data.newsAggList,
                        timeline: data.timeline,
                    });
                    item.author = data.entityList.map((a) => a.name).join('/');
                    item.category = data.tagList.map((c) => c.name);
                    item.guid = `readhub-${data.uid}`;
                    item.pubDate = timezone(parseDate(data.publishDate), +8);

                    return item;
                })
            )
        );
    }

    const $ = cheerio.load(currentResponse);

    const author = $('meta[property="og:site_name"]').prop('content');
    const subtitle = $(
        $('nav div a')
            .toArray()
            .filter((a) => /style_active.*/.test($(a).prop('class')))
            .pop()
    ).text();
    const icon = new URL($('link[rel="apple-touch-icon"]').prop('href'), rootUrl).href;

    ctx.state.data = {
        item: items,
        title: `${author} - ${subtitle}`,
        link: currentUrl,
        description: $('meta[property="og:description"]').prop('content'),
        language: $('html').prop('lang'),
        image: $('meta[property="og:image"]').prop('content'),
        icon,
        logo: icon,
        subtitle,
        author,
        allowEmpty: true,
    };
};
