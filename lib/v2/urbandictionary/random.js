const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.urbandictionary.com';
    const { data } = await got('https://api.urbandictionary.com/v0/random');

    const items = data.list.map((item) => ({
        title: item.word,
        description: art(path.join(__dirname, 'templates/definition.art'), { item }),
        link: `${baseUrl}/define.php?term=${item.word}`,
        guid: item.permalink,
        pubDate: parseDate(item.written_on),
        author: item.author,
    }));

    ctx.state.data = {
        title: 'Urban Dictionary: Random words',
        link: `${baseUrl}/random.php`,
        item: items,
    };
};
