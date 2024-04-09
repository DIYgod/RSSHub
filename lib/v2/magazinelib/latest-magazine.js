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
            _embed: 1,
        },
    });
    let subTitle = query;
    if (subTitle !== undefined) {
        subTitle = subTitle.replace(/[^a-zA-Z0-9]+/g, ' ').toUpperCase();
        subTitle = ` - ${subTitle}`;
    } else {
        subTitle = '';
    }

    const items = response.data.map((obj) => {
        const data = {};
        data.date = obj.date_gmt;
        data.link = obj.link;
        data.featuredMediaLink = obj._links['wp:featuredmedia'][0].href;
        data.title = obj.title.rendered;
        const $ = cheerio.load(obj.content.rendered);
        const content = $('.vk-att');
        content.find('img[src="https://magazinelib.com/wp-includes/images/media/default.png"]').remove();
        data.content = content.html();
        const imgUrl = obj._embedded['wp:featuredmedia'][0].source_url;
        data.description = data.content + art(path.join(__dirname, 'templates/magazine-description.art'), { imgUrl });
        data.categories = obj._embedded['wp:term'][0].map((item) => item.name);
        return data;
    });

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
