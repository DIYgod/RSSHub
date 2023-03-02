const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const type = ctx.params.type || 'movie_weekly_best';

    const link = 'https://m.douban.com/movie';
    const apiUrl = `https://m.douban.com/rexxar/api/v2/subject_collection/${type}`;

    const itemResponse = await got({
        method: 'get',
        url: `${apiUrl}/items?start=0&count=10`,
        headers: {
            Referer: link,
        },
    });
    const infoResponse = await got({
        method: 'get',
        url: apiUrl,
        headers: {
            Referer: link,
        },
    });

    const data = itemResponse.data.subject_collection_items;

    ctx.state.data = {
        title: infoResponse.data.title,
        link: `https://m.douban.com/subject_collection/${type}`,
        description: infoResponse.data.description,

        item: data.map(({ title, cover, cover_url, url, rating, null_rating_reason, description, card_subtitle, photos }) => {
            const rate = rating ? `${rating.value.toFixed(1)}分` : null_rating_reason;
            if (cover && cover.url) {
                cover_url = cover.url;
            }

            return {
                title,
                description: art(path.join(__dirname, '../templates/weekly_best.art'), {
                    title,
                    card_subtitle,
                    description,
                    rate,
                    cover_url,
                    photos,
                }),
                link: url,
            };
        }),
    };
};
