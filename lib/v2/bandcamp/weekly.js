const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const rootUrl = 'https://bandcamp.com';
    const apiUrl = `${rootUrl}/api/bcweekly/3/list`;
    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.results.slice(0, 50).map((item) => ({
        title: item.title,
        link: `${rootUrl}/?show=${item.id}`,
        pubDate: parseDate(item.published_date),
        description: art(path.join(__dirname, 'templates/weekly.art'), {
            v2_image_id: item.v2_image_id,
            desc: item.desc,
        }),
    }));

    ctx.state.data = {
        title: 'Bandcamp Weekly',
        link: rootUrl,
        item: items,
    };
};
