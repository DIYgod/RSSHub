const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { category = 'zuixin' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 20;

    const rootUrl = 'https://www.gov.cn';
    const currentUrl = new URL(`zhengce/${category.replace(/\/$/, '')}/`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    let items = $('h4 a, div.subtitle a[title]')
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.prop('href');

            return {
                title: item.text(),
                link: link.startsWith('http') ? link : new URL(link, currentUrl).href,
            };
        });

    items = await Promise.all(
        items
            .filter((item) => /https?:\/\/www\.gov\.cn\/zhengce.*content_\d+\.htm/.test(item.link))
            .slice(0, limit)
            .map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const { data: detailResponse } = await got(item.link);

                    const content = cheerio.load(detailResponse);

                    const processElementText = (el) => content(el).text().split(/：/).pop().trim() || content(el).next().text().trim();

                    const author = content('meta[name="author"]').prop('content');

                    const agencyEl = content('table.bd1')
                        .find('td')
                        .toArray()
                        .filter((a) => content(a).text().startsWith('发文机关'))
                        .pop();

                    const sourceEl = content('span.font-zyygwj')
                        .toArray()
                        .filter((a) => content(a).text().startsWith('来源'))
                        .pop();

                    const subjectEl = content('table.bd1')
                        .find('td')
                        .toArray()
                        .filter((a) => content(a).text().startsWith('主题分类'))
                        .pop();

                    const agency = agencyEl ? processElementText(agencyEl) : undefined;
                    const source = sourceEl ? processElementText(sourceEl) : undefined;
                    const subject = subjectEl ? processElementText(subjectEl) : content('td.zcwj_ztfl').text();

                    const column = content('meta[name="lanmu"]').prop('content');
                    const keywords = content('meta[name="keywords"]').prop('content')?.split(/;|,/) ?? [];
                    const manuscriptId = content('meta[name="manuscriptId"]').prop('content');

                    item.title = content('div.share-title').text() || item.title;
                    item.description = content('div.TRS_UEDITOR').first().html() || content('div#UCAP-CONTENT, td#UCAP-CONTENT').first().html();
                    item.author = [agency, source, author].filter((a) => a).join('/');
                    item.category = [...new Set([subject, column, ...keywords].filter((c) => c))];
                    item.guid = `gov-zhengce-${manuscriptId}`;
                    item.pubDate = timezone(parseDate(content('meta[name="firstpublishedtime"]').prop('content'), 'YYYY-MM-DD-HH:mm:ss'), +8);
                    item.updated = timezone(parseDate(content('meta[name="lastmodifiedtime"]').prop('content'), 'YYYY-MM-DD-HH:mm:ss'), +8);

                    return item;
                })
            )
    );

    const image = new URL($('img.wordlogo').prop('src'), rootUrl).href;
    const icon = new URL($('link[rel="icon"]').prop('href'), rootUrl).href;
    const subtitle = $('meta[name="lanmu"]').prop('content');
    const author = $('div.header_logo a[aria-label]').prop('aria-label');

    ctx.state.data = {
        item: items,
        title: author && subtitle ? `${author} - ${subtitle}` : $('title').text(),
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh-CN',
        image,
        icon,
        logo: icon,
        subtitle,
        author,
    };
};
