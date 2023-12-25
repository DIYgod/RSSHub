const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate, parseRelativeDate } = require('@/utils/parse-date');

/**
 * Convert an array into a dictionary object.
 * The keys of the dictionary object are the `id` properties of the elements in the array,
 * and the values are the remaining properties of each element.
 * @param {Array} arr - The array to be converted.
 * @returns {Object} - The converted dictionary object.
 */
const arrayToDictionary = (arr) =>
    arr.reduce(
        (dictionary, { id, ...rest }) => ({
            ...dictionary,
            [id]: {
                ...rest,
            },
        }),
        {}
    );

module.exports = async (ctx) => {
    const { proma } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 5;

    const title = '晚点';
    const defaultTitle = '最新报道';
    const exclusiveCategory = '晚点独家';

    const rootUrl = 'https://www.latepost.com';
    const currentUrl = new URL(proma ? `news/index?proma=${proma}` : '', rootUrl).href;

    const apiColumnUrl = new URL('site/get-column', rootUrl).href;
    const apiCommentUrl = new URL('news/get-comment', rootUrl).href;
    const apiUrl = new URL(proma ? 'news/get-news-data' : 'site/index', rootUrl).href;

    const { data: columnResponse } = await got(apiColumnUrl);
    const columns = arrayToDictionary(columnResponse?.data ?? []);

    const { data: response } = await got.post(apiUrl, {
        form: {
            page: 1,
            limit,
            programa: parseInt(proma, 10),
        },
    });

    let items = response.data.slice(0, limit).map((item) => ({
        title: item.title,
        link: new URL(item.detail_url, rootUrl).href,
        category: [item.is_dj ? exclusiveCategory : undefined, item.programa ? columns[item.programa].title : undefined, ...item.label.map((c) => c.label)],
        guid: item.id,
        pubDate: parseDate(item.release_time, ['MM月DD日', 'YYYY年MM月DD日']),
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const { data: commentResponse } = await got.post(apiCommentUrl, {
                    news_id: item.guid,
                    page: 1,
                    limit: Infinity,
                    sort: 1,
                    delete_num: 0,
                });

                const content = cheerio.load(detailResponse);

                item.title = item.title ?? content('div.article-header-title').text();
                item.description = content('#select-main')
                    .html()
                    .replace(/<p><br><\/p>/g, '');
                item.author = content('div.article-header-author div.author-link a.label').first().text();
                item.category = item.category.filter((c) => c);
                item.guid = `latepost-${item.guid}`;

                const pubDate = content('div.article-header-date').text();

                if (pubDate) {
                    if (/\d+月\d+日/.test(pubDate)) {
                        item.pubDate = parseDate(pubDate, ['MM月DD日 HH:mm', 'YYYY年MM月DD日 HH:mm']);
                    } else {
                        item.pubDate = parseRelativeDate(pubDate);
                    }
                }

                item.pubDate = timezone(item.pubDate, +8);
                item.comments = commentResponse.data?.length() ?? 0;

                return item;
            })
        )
    );

    const icon = new URL('favicon.ico', rootUrl).href;

    const { data: currentResponse } = await got(currentUrl);

    const $ = cheerio.load(currentResponse);

    ctx.state.data = {
        item: items,
        title: `${title} - ${proma ? columns[proma].title : defaultTitle}`,
        link: currentUrl,
        description: $('div.logo-txt').first().text(),
        language: 'zh-cn',
        image: new URL($('div.logo-txt img').prop('src'), rootUrl).href,
        icon,
        logo: icon,
        author: title,
    };
};
