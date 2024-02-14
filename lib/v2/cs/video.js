const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { category = '今日聚焦' } = ctx.params;
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 50;

    const rootUrl = 'https://video.cs.com.cn';
    const apiCategoryUrl = new URL('web/api/getCategory', rootUrl).href;
    const apiUrl = new URL('web/api/toSecondPage', rootUrl).href;

    const {
        data: { data: categoryResponse },
    } = await got.post(apiCategoryUrl);

    const categories = categoryResponse.map((c) => ({
        id: c.id,
        title: c.categoryTitle,
        image: c.categoryImg,
        sortType: c.categorySortType,
    }));

    const selected = categories.find((c) => c.title === category || c.id === category);

    const currentUrl = new URL(`list.html?title=${selected.title}&id=${selected.id}`, rootUrl).href;

    const {
        data: { records: response },
    } = await got.post(apiUrl, {
        json: {
            categorySortType: selected.sortType,
            id: selected.id,
            pageNum: 1,
            pageSize: limit,
        },
    });

    const items = response.slice(0, limit).map((item) => ({
        title: item.contentTitle,
        link: new URL(item.contentUrl, rootUrl).href,
        description: item.contentDetails,
        author: item.contentSource,
        pubDate: timezone(parseDate(item.contentDatetime), +8),
        updated: timezone(parseDate(item.updateDate), +8),
    }));

    const { data: currentResponse } = await got(currentUrl);

    const $ = cheerio.load(currentResponse);

    const title = $('title').text();
    const image = selected.image;
    const icon = new URL($('link[rel="icon"]').prop('href'), rootUrl).href;

    ctx.state.data = {
        item: items,
        title: `${title} | ${selected.title}`,
        link: currentUrl,
        description: $('meta[name="Description"]').prop('content'),
        language: $('html').prop('lang'),
        image,
        icon,
        logo: icon,
        subtitle: $('meta[name="Keywords"]').prop('content'),
        author: title.split('-').pop().trim(),
        allowEmpty: true,
    };
};
