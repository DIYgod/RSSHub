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

    const data = response.data;
    const $ = cheerio.load(data);

    let list = $('.g1-collection-item');
    list = list.filter(function () {
        const title = $(this).find('.entry-title').text();
        return title.length !== 0;
    });
    list = list
        .map(function () {
            return { link: $(this).find('.entry-title a').attr('href') };
        })
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
                data.imgUrl = content('.vkwpb_img_wrap img').attr('data-lazy-src');
                data.pubDate = content('.entry-date').attr('datetime');
                data.downloadLink = content('.vk-att-item > a').attr('href');
                data.description = art(path.join(__dirname, 'templates/magazine-description.art'), { data });
                return data;
            })
        )
    );
    ctx.state.data = {
        title: 'MagazineLib - Latest Magazines',
        link: url,
        description: 'MagazineLib - Latest Magazines',
        item: items.map((item) => ({
            title: item.title,
            link: item.downloadLink,
            category: item.categories,
            pubDate: new Date(item.pubDate).toUTCString(),
            description: item.description,
        })),
    };
};
