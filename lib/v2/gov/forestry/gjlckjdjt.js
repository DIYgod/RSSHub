const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { category = 'gjlckjdjt' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30;

    const rootUrl = 'http://www.forestry.gov.cn';
    const currentUrl = new URL(`${category}.jhtml`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    let items = $('a.items')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.find('p.name').text();
            const link = new URL(item.prop('href'), rootUrl).href;
            const pubDateMatches = link.match(/\/\d{8}\//);

            return {
                title,
                link,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    image: {
                        src: item.find('img').prop('src'),
                        alt: title,
                    },
                }),
                pubDate: pubDateMatches ? parseDate(pubDateMatches[1]) : undefined,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = cheerio.load(detailResponse);

                content('p').each((_, e) => {
                    e = content(e);
                    if (e.find('img, video, embed.edui-faked-video').length === 0 && e.text().match(/^\s*$/)) {
                        e.remove();
                    }
                });

                content('video, embed.edui-faked-video').each((_, e) => {
                    e = content(e);

                    const src = e.prop('src');
                    item.enclosure_url = item.enclosure_url ?? src;

                    e.replaceWith(
                        art(path.join(__dirname, 'templates/description.art'), {
                            video: {
                                src,
                            },
                        })
                    );
                });

                const pubDateMatches = item.link.match(/\/\d{8}\//);

                item.title = content('div.tit').text();
                item.description += content('div.zhengwen').html();
                item.pubDate = pubDateMatches ? parseDate(pubDateMatches[1]) : undefined;
                item.enclosure_type = item.enclosure_url ? 'video/mp4' : undefined;

                return item;
            })
        )
    );

    const icon = new URL('favicon.ico', rootUrl).href;

    ctx.state.data = {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        language: $('html').prop('lang'),
        image: new URL('r/cms/www/default/zhuanti/2021djt/images/top.png', rootUrl).href,
        icon,
        logo: icon,
        subtitle: $('div.weizhi').contents().last().text(),
        author: '国家林业和草原局',
        allowEmpty: true,
    };
};
