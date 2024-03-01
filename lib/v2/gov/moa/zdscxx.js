const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { category } = ctx.params;
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 5;

    const domain = 'moa.gov.cn';
    const rootFrameUrl = `http://www.${domain}`;
    const rootUrl = `http://zdscxx.${domain}:8080`;
    const apiUrl = new URL('nyb/getMessages', rootUrl).href;
    const apiDetailUrl = new URL('nyb/getMessagesById', rootUrl).href;
    const currentUrl = new URL('nyb/pc/messageList.jsp', rootUrl).href;
    const frameUrl = new URL('iframe/top_sj/', rootFrameUrl).href;

    let filterForm = {};

    if (category) {
        const apiFilterUrl = new URL('nyb/getMessageFilters', rootUrl).href;

        const { data: filterResponse } = await got.post(apiFilterUrl, {
            form: {
                type: '',
                isLatestMessage: false,
            },
        });

        const filters = filterResponse.result.reduce((filters, f) => {
            filters[f.name] = f.data.map((d) => d.name);
            return filters;
        }, {});

        filterForm = category.split(/\//).reduce((form, c) => {
            for (const key of Object.keys(filters).filter((key) => filters[key].includes(c))) {
                form[key] = c;
            }
            return form;
        }, {});
    }

    const { data: response } = await got.post(apiUrl, {
        form: {
            page: 1,
            rows: limit,
            type: '',
            isLatestMessage: false,
            ...filterForm,
        },
    });

    let items = response.result.table.slice(0, limit).map((item) => ({
        title: item.title,
        link: item.id,
        guid: `moa-zdscxx-${item.id}`,
        pubDate: parseDate(item.date),
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.guid, async () => {
                const { data: detailResponse } = await got.post(apiDetailUrl, {
                    form: {
                        id: item.link,
                    },
                });

                const data = detailResponse.result;

                item.title = data.title;
                item.link = new URL(`nyb/pc/messageView.jsp?id=${item.link}`, rootUrl).href;
                item.description = data.content;
                item.author = data.source;
                item.pubDate = parseDate(data.date);

                return item;
            })
        )
    );

    const { data: frameResponse } = await got(frameUrl);

    const $ = cheerio.load(frameResponse);

    const title = $('title').text();
    const description = '数据';
    const icon = new URL('favicon.ico', rootUrl).href;

    ctx.state.data = {
        item: items,
        title: `${title} - ${description} - ${category}`,
        link: currentUrl,
        description,
        language: 'zh',
        image: $('h1.logo a img').prop('src'),
        icon,
        logo: icon,
        subtitle: category,
        author: title,
        allowEmpty: true,
    };
};
