const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const label = ctx.params.label ?? '';

    const rootUrl = 'https://www.mygopen.com';
    const currentUrl = `${rootUrl}${label ? `/search/label/${label}` : ''}`;
    const apiUrl = `${rootUrl}/feeds/posts/default${label ? `/-/${label}` : ''}?alt=json-in-script&max-results=${ctx.query.limit ? parseInt(ctx.query.limit) : 50}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = JSON.parse(response.data.match(/gdata\.io\.handleScriptLoaded\((.*)\);/)[1]).feed.entry.map((item) => ({
        title: item.title.$t,
        description: item.content.$t,
        pubDate: parseDate(item.published.$t),
        link: item.link.pop().href,
    }));

    ctx.state.data = {
        title: `MyGoPen${label ? `: ${label}` : ''}`,
        link: currentUrl,
        item: items,
        description: '詐騙與謠言頻傳的年代，「MyGoPen｜這是假消息」提醒網路使用者隨時要用謹慎懷疑的態度面對網路上的消息。',
    };
};
