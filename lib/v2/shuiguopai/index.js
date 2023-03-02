const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const rootUrl = 'https://shuiguopai.com';
    const apiRootUrl = 'https://api.cbbee0.com';
    const listUrl = `${apiRootUrl}/v1_2/homePage`;
    const filmUrl = `${apiRootUrl}/v1_2/filmInfo`;

    const response = await got({
        method: 'post',
        url: listUrl,
        json: {
            device_id: '',
            hm: '008-api',
            last_page: 0,
            length: 3,
            ltype: 1,
            page: 1,
            userToken: '',
        },
    });

    let items = response.data.data.list.map((item) => ({
        title: item.title,
        guid: item.library_id,
        link: `${rootUrl}/play-details/${item.library_id}`,
        pubDate: timezone(parseDate(item.show_time, 'MM月DD日 HH:mm'), +8),
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);
                content('iframe').remove();

                const infoResponse = await got({
                    method: 'post',
                    url: filmUrl,
                    json: {
                        device_id: '',
                        film_id: detailResponse.data.match(/film_id:"(\d+)",/)[1],
                        hm: '008-api',
                        userToken: '',
                    },
                });

                const data = infoResponse.data.data[0];

                item.author = data.actor;
                item.category = data.tags.map((t) => t.tag_title);
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    video: data.download_url,
                    description: content('.content').html(),
                });

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '水果派',
        link: rootUrl,
        item: items,
    };
};
