const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const response = await got('https://www.cngal.org/api/news/GetWeeklyNewsOverview');

    ctx.state.data = {
        title: 'CnGal - 每周速报',
        link: 'https://www.cngal.org/weeklynews',
        item: response.data.map((item) => ({
            title: item.name,
            description: art(path.join(__dirname, 'templates/weekly-description.art'), item),
            pubDate: parseDate(item.lastEditTime),
            link: `https://www.cngal.org/articles/index/${item.id}`,
        })),
    };
    ctx.state.json = response.data;
};
