const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');

const host = 'https://magazinelib.com';
module.exports = async (ctx) => {
    const query = ctx.params.query;
    const url = host;
    const response = await got({
        method: 'get',
        url,
        searchParams: {
            s: query,
        },
    });
    let subTitle = query;
    if (subTitle !== undefined) {
        subTitle = subTitle.replace(/[^a-zA-Z0-9]+/g, ' ').toUpperCase();
        subTitle = ` - ${subTitle}`;
    } else {
        subTitle = '';
    }

    const data = response.data;
    const $ = cheerio.load(data);

    let list = $('.g1-collection-item');
    list = list.filter((_, el) => {
        const title = $(el).find('.entry-title').text();
        return title.length !== 0;
    });
    list = list
        .map((_, el) => ({
            link: $(el).find('.entry-title a').attr('href'),
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const data = {};
                const content = cheerio.load(detailResponse.data);
                data.title = content('.entry-title').text();
                data.categories = content('p.entry-categories a')
                    .map((_, el) => $(el).text().trim())
                    .get();
                data.imgUrl = content('.vkwpb_img_wrap img').data('lazy-src');
                data.pubDate = content('.entry-date').attr('datetime');
                data.link = item.link;
                data.downloadLink = content('.vk-att-item > a').attr('href');
                data.description = art(path.join(__dirname, 'templates/magazine-description.art'), { data });
                return data;
            })
        )
    );
    ctx.state.data = {
        title: `MagazineLib - Latest Magazines${subTitle}`,
        link: response.url,
        description: `MagazineLib - Latest Magazines${subTitle}`,
        item: items.map((item) => ({
            title: item.title,
            link: item.link,
            category: item.categories,
            pubDate: new Date(item.pubDate).toUTCString(),
            description: item.description,
        })),
    };
};
