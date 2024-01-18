const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const columns = {
    article: 2,
    report: 3,
    visualization: 4,
};

module.exports = async (ctx) => {
    const { column = 'article', category = '0' } = ctx.params;
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 30;

    const rootUrl = 'https://dt.yicai.com';
    const apiUrl = new URL('api/getNewsList', rootUrl).href;
    const currentUrl = new URL(column, rootUrl).href;

    const { data: response } = await got(apiUrl, {
        searchParams: {
            page: 1,
            rid: columns[column],
            cid: category,
            pageSize: limit,
        },
    });

    let items = response.data.data.slice(0, limit).map((item) => {
        const enclosureUrl = item.originVideo;
        const enclosureExt = enclosureUrl.split(/\./).pop();

        return {
            title: item.newstitle,
            link: new URL(item.url, rootUrl).href,
            description: art(path.join(__dirname, 'templates/description.art'), {
                image: {
                    src: item.originPic,
                    alt: item.newstitle,
                },
                intro: item.newsnotes,
            }),
            author: item.creatername,
            category: [item.channelrootname, item.channelname, item.NewsTypeName].filter(Boolean),
            guid: `yicai-dt-${item.newsid}`,
            pubDate: parseDate(item.utc_createdate),
            updated: parseDate(item.utc_lastdate),
            enclosure_url: enclosureUrl,
            enclosure_type: enclosureUrl ? `${enclosureExt === 'mp4' ? 'video' : 'application'}/${enclosureExt}` : undefined,
            upvotes: item.newsscore ?? 0,
        };
    });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = cheerio.load(detailResponse);

                content('div.logintips').remove();

                content('img').each((_, e) => {
                    e = content(e);

                    content(e).replaceWith(
                        art(path.join(__dirname, 'templates/description.art'), {
                            image: {
                                src: e.prop('data-original') ?? e.prop('src'),
                                alt: e.prop('alt'),
                                width: e.prop('width'),
                                height: e.prop('height'),
                            },
                        })
                    );
                });

                item.description += art(path.join(__dirname, 'templates/description.art'), {
                    description: content('div.txt').html(),
                });
                item.author = content('div.authortime h3').text();

                return item;
            })
        )
    );

    const { data: currentResponse } = await got(currentUrl);

    const $ = cheerio.load(currentResponse);

    const title = $('title').text();
    const image = $('div.logo a img').prop('src');
    const icon = new URL($('link[rel="shortcut icon"]').prop('href'), rootUrl).href;

    ctx.state.data = {
        item: items,
        title: `${$(`a[data-cid="${category}"]`).text()}${title}`,
        link: currentUrl,
        description: $('meta[name="keywords"]').prop('content'),
        language: 'zh',
        image,
        icon,
        logo: icon,
        subtitle: $('meta[name="description"]').prop('content'),
        author: title.split(/_/).pop(),
        allowEmpty: true,
    };
};
