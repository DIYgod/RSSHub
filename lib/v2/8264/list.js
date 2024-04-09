const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { id = '751' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30;

    const rootUrl = 'https://www.8264.com';
    const currentUrl = new URL(`list/${id}`, rootUrl).href;

    const { data: response } = await got(currentUrl, {
        responseType: 'buffer',
    });

    const $ = cheerio.load(iconv.decode(response, 'gbk'));

    $('div.newslist_info').remove();

    let items = $('div.newlist_r, div.newslist_r, div.bbslistone_name, dt')
        .find('a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.prop('href');

            return {
                title: item.text(),
                link: /^http/.test(link) ? link : new URL(link, rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link, {
                    responseType: 'buffer',
                });

                const content = cheerio.load(iconv.decode(detailResponse, 'gbk'));

                content('a.syq, a.xlsj, a.titleoverflow200, #fjump').remove();
                content('i.pstatus').remove();
                content('div.crly').remove();

                const pubDate = content('span.pub-time').text() || content('span.fby span').first().prop('title') || content('span.fby').first().text().split('发表于').pop().trim();

                content('img').each(function () {
                    content(this).replaceWith(
                        art(path.join(__dirname, 'templates/description.art'), {
                            image: {
                                src: content(this).prop('file'),
                                alt: content(this).prop('alt'),
                            },
                        })
                    );
                });

                item.title = content('h1').first().text();
                item.description = content('div.art-content, td.t_f').first().html();
                item.author = content('a.user-name, #author').first().text();
                item.category = content('div.fl_dh a, div.site a')
                    .toArray()
                    .map((c) => content(c).text().trim());
                item.pubDate = timezone(parseDate(pubDate, ['YYYY-MM-DD HH:mm', 'YYYY-M-D HH:mm']), +8);

                return item;
            })
        )
    );

    const description = $('meta[name="description"]').prop('content').trim();
    const icon = new URL('favicon', rootUrl).href;

    ctx.state.data = {
        item: items,
        title: `${$('span.country, h2').text()} - ${description.split(',').pop()}`,
        link: currentUrl,
        description,
        language: 'zh-cn',
        icon,
        logo: icon,
        subtitle: $('meta[name="keywords"]').prop('content').trim(),
        author: $('meta[name="author"]').prop('content'),
    };
};
