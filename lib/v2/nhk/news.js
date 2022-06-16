const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const baseUrl = 'https://www3.nhk.or.jp';
const apiUrl = 'https://nwapi.nhk.jp';

module.exports = async (ctx) => {
    const { lang = 'en' } = ctx.params;
    const { data } = await got(`${apiUrl}/nhkworld/rdnewsweb/v7b/${lang}/outline/list.json`);
    const meta = await got(`${baseUrl}/nhkworld/common/assets/news/config/${lang}.json`);

    let items = data.data.map((item) => ({
        title: item.title,
        description: item.description,
        link: `${baseUrl}${item.page_url}`,
        pubDate: parseDate(item.updated_at, 'x'),
        id: item.id,
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data } = await got(`${apiUrl}/nhkworld/rdnewsweb/v6b/${lang}/detail/${item.id}.json`);
                item.category = Object.values(data.data.categories);
                item.description = art(path.join(__dirname, 'templates/news.art'), {
                    img: data.data.thumbnails,
                    description: data.data.detail.replace('\n\n', '<br><br>'),
                });
                delete item.id;
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${Object.values(meta.data.config.navigation.header).find((h) => h.keyname === 'topstories').name} | NHK WORLD-JAPAN News`,
        link: `${baseUrl}/nhkworld/${lang}/news/list/`,
        item: items,
    };
};
