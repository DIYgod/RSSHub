const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 10;

    const rootUrl = 'https://layer3.xyz';
    const currentUrl = `${rootUrl}/quests/new`;
    const apiUrl = `${rootUrl}/api/trpc/task.newTasksForUser?batch=1&input={"0":{"json":{"cursor":0}}}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data[0].result.data.json.items.slice(0, limit).map((item) => ({
        title: item.title,
        link: `${rootUrl}/quests/${item.namespace}`,
        pubDate: parseDate(item.createdAt),
        author: item.Dao.name,
        category: [item.taskType, item.rewardType],
        description: art(path.join(__dirname, 'templates/description.art'), {
            image: `https://imgp.layer3cdn.com/cdn-cgi/image/?format=auto/ipfs/${item.imageCid}`,
            description: item.missionDoc,
            createdAt: item.createdAt,
            expirationDate: item.expirationDate,
        }),
    }));

    ctx.state.data = {
        title: 'Layer3 - Latest Quests',
        link: currentUrl,
        item: items,
    };
};
