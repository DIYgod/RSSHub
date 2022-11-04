const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

async function getFeedItem(item) {
    const response = await got(`https://gocn.vip/apiv3/topic/${item.guid}/info`);

    return {
        link: `https://gocn.vip/topics/${item.guid}`,
        title: item.title,
        description: response.data.data.topic.contentHtml,
        pubDate: parseDate(item.ctime, 'X'),
    };
}

module.exports = {
    getFeedItem,
};
