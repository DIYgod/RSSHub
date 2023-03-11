const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');

const host = 'https://magazinelib.com';
module.exports = async (ctx) => {
    const query = ctx.params.query;
    const url = `${host}/wp-json/wp/v2/posts/`;
    const response = await got({
        method: 'get',
        url,
        searchParams: {
            search: query,
            per_page: 30,
        },
    });
    let subTitle = query;
    if (subTitle !== undefined) {
        subTitle = subTitle.replace(/[^a-zA-Z0-9]+/g, ' ').toUpperCase();
        subTitle = ` - ${subTitle}`;
    } else {
        subTitle = '';
    }

    const list = response.data.map((obj) => {
        const data = {};
        data.date = obj.date;
        data.link = obj.link;
        data.featuredMediaLink = obj._links['wp:featuredmedia'][0].href;
        data.title = obj.title.rendered;
        const $ = cheerio.load(obj.content.rendered);
        const content = $('.vk-att');
        content.find('img[src="https://magazinelib.com/wp-includes/images/media/default.png"]').remove();
        data.content = content.html();
        return data;
    });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.featuredMediaLink, async () => {
                const mediaResponse = await got({
                    method: 'get',
                    url: item.featuredMediaLink,
                });
                const imgUrl = mediaResponse.data.source_url;
                return {
                    title: item.title,
                    link: item.link,
                    pubDate: new Date(item.date).toUTCString(),
                    description: item.content + art(path.join(__dirname, 'templates/magazine-description.art'), { imgUrl }),
                };
            })
        )
    );
    ctx.state.data = {
        title: `MagazineLib - Latest Magazines${subTitle}`,
        link: `{host}/?s=${query}`,
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
