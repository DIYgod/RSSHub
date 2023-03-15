const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'feature-stories';
    const language = ctx.params.language ?? '';

    const rootUrl = 'https://www.who.int';
    const currentUrl = `${rootUrl}/${language ? `${language}/` : ''}news-room/${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let list = $('.list-view--item a');

    if (list.length === 0) {
        const response = await got({
            method: 'get',
            url: `${rootUrl}/api/hubs/${category.replace(/-/g, '')}?sf_culture=zh&$orderby=PublicationDateAndTime%20desc&$select=Title,PublicationDateAndTime,ItemDefaultUrl&$top=30`,
        });

        list = response.data.value.map((item) => ({
            title: item.Title,
            link: `${currentUrl}/detail/${item.ItemDefaultUrl}`,
            pubDate: parseDate(item.PublicationDateAndTime),
        }));
    } else {
        list = list
            .map((_, item) => {
                item = $(item);
                const link = item.attr('href');

                return {
                    link: `${link.indexOf('http') === 0 ? '' : rootUrl}${item.attr('href')}`,
                };
            })
            .get();
    }

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const matches = detailResponse.data.match(/"headline":"(.*)","description":"(.*)","datePublished":"(.*)","image"/);

                if (matches) {
                    item.title = matches[1];
                    item.description = matches[2];
                    item.pubDate = parseDate(matches[3]);
                } else {
                    const content = cheerio.load(detailResponse.data);

                    item.description = content('.sf-content-block').html();
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('meta[property="og:title"]').attr('content')} - WHO`,
        link: currentUrl,
        item: items,
    };
};
