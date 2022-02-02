const got = require('@/utils/got');
const config = require('@/config').value;
const { art } = require('@/utils/render');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');

const titleMap = {
    date: 'Newest',
    popularity: 'Most Popular',
    trending: 'Trending',
    alpha: 'Name',
    style: 'Number of styles',
};

module.exports = async (ctx) => {
    const sort = ctx.params.sort ?? 'date';
    const limit = ctx.params.limit ?? 25;

    const API_KEY = config.google.fontsApiKey;
    if (!API_KEY) {
        throw new Error('Google Fonts API key is required.');
    }

    const googleFontsAPI = `https://www.googleapis.com/webfonts/v1/webfonts?sort=${sort}&key=${API_KEY}`;

    const response = await got.get(googleFontsAPI);
    const data = response.data.items.slice(0, limit);

    ctx.state.data = {
        title: `Google Fonts - ${titleMap[sort]}`,
        link: 'https://fonts.google.com',
        item:
            data &&
            data.map((item) => ({
                title: item.family,
                description: art(path.join(__dirname, './templates/fonts.art'), {
                    item,
                }),
                link: `https://fonts.google.com/specimen/${item.family.replace(/\s/g, '+')}`,
                pubDate: parseDate(item.lastModified, 'YYYY-MM-DD'),
            })),
    };
};
