const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const entryId = ctx.params.id;

    const response = await got(`https://www.cngal.org/api/entries/GetEntryView/${entryId}`);

    const data = response.data;

    ctx.state.data = {
        title: `CnGal - ${data.name} 的动态`,
        link: `https://www.cngal.org/entries/index/${entryId}`,
        item: data.newsOfEntry.map((item) => ({
            title: item.title,
            description: art(path.join(__dirname, 'templates/entry-description.art'), item),
            pubDate: timezone(parseDate(item.happenedTime), +8),
            link: item.link,
        })),
    };
    ctx.state.json = response.data;
};
