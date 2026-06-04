const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const name = ctx.params.name;
    const season = ctx.params.season;

    let link = `https://ddys.pro/${name}/`;

    if (season) {
        link += `${season}/`;
    }

    const response = await got(link);
    const $ = cheerio.load(response.body);

    const title = $('title').html();
    const description = $('.abstract').html();
    const tracks = JSON.parse($('.wp-playlist-script').html()).tracks.reverse();
    const total = tracks.length;

    ctx.state.data = {
        title,
        link,
        description,
        item: tracks.map(({ caption, description }, index) => ({
            title: caption,
            link: `${link}?ep=${total - index}`,
            description,
        })),
    };
};
