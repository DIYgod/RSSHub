const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const { isValidHost } = require('@/utils/valid-host');

module.exports = async (ctx) => {
    const lang = ctx.params.lang;
    const type = ctx.params.type ?? 'all';

    if (!isValidHost(lang)) {
        throw Error('Invalid lang');
    }

    const response = await got({
        method: 'get',
        url: `https://lodestonenews.com/news/${type}?locale=${lang}`,
    });

    let data;
    if (type === 'all') {
        data = [];
        Object.values(response.data).forEach((arr) => (data = data.concat(arr)));
    } else {
        data = response.data;
    }

    ctx.state.data = {
        title: `FFXIV Lodestone updates (${type})`,
        link: `https://${lang}.finalfantasyxiv.com/lodestone/news/`,
        item: data.map(({ id, url, title, time, description, image }) => ({
            title,
            link: url,
            description: art(path.join(__dirname, 'templates/description.art'), {
                image,
                description,
            }),
            pubDate: parseDate(time),
            guid: id,
        })),
    };
};
