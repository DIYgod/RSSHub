const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const { baseUrl: rootUrl, momentApi: apiRootUrl } = require('./utils');

module.exports = async (ctx) => {
    const currentUrl = `${rootUrl}/moment`;
    const apiUrl = `${apiRootUrl}/web-v2/moment/feed`;

    const response = await got({
        method: 'post',
        url: apiUrl,
        form: {
            last_dateline: parseInt(new Date().getTime() / 1000),
            platform: 'www',
            is_ai: 0,
        },
    });

    const items = response.data.data.moment_list.datalist[0].datalist.map((item) => ({
        title: item.content,
        link: item.share_url,
        author: item.user_info.username,
        pubDate: parseDate(item.publish_time * 1000),
        description: art(path.join(__dirname, 'templates/moment.art'), {
            description: item.content,
            images: item.img_urls,
            video: item.video,
            comments: item.comment,
        }),
    }));

    ctx.state.data = {
        title: '虎嗅 - 24小时',
        link: currentUrl,
        item: items,
    };
};
