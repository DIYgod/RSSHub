const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const root_url = 'https://inf.ds.163.com';

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const current_url = `${root_url}/v1/web/feed/basic/getSomeOneFeeds?feedTypes=1,2,3,4,6,7,10,11&someOneUid=${id}`;
    const response = await got({
        method: 'get',
        url: current_url,
    });
    const data = response.data.result.feeds;

    const list = data.map((feed) => ({
        title: JSON.parse(feed.content).body.text,
        link: `https://ds.163.com/feed/${feed.id}`,
        description: art(path.resolve(__dirname, 'templates/ds.art'), {
            text: JSON.parse(feed.content).body.text,
            medias: JSON.parse(feed.content).body.media,
        }),
        pubDate: parseDate(feed.updateTime),
    }));

    ctx.state.data = {
        title: `${response.data.result.userInfos[0].user.nick} 的动态`,
        link: `https://ds.163.com/user/${id}`,
        item: list,
    };
};
