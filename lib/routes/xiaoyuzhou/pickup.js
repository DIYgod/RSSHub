const got = require('@/utils/got');
const config = require('@/config').value;

function secondsTillTomorrow() {
    const d = new Date();
    const seconds_today = d.getSeconds() + 60 * (d.getMinutes() + 60 * d.getHours());
    return 86400 - seconds_today;
}

module.exports = async (ctx) => {
    const resultItems = await ctx.cache.tryGet(
        'xiaoyuzhou_items',
        async () => {
            const device_id = config.xiaoyuzhou.device_id || 'f5d56d9a-8530-49a4-a6d2-cfb4b7a31240';
            const refresh_token =
                (await ctx.cache.get('XIAOYUZHOU_TOKEN')) ||
                config.xiaoyuzhou.refresh_token ||
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiVzhieXB2dTJtT24xZWNqcEppN2p6R2xhMDBhMHYxellLaHFcL0ZXVWVkdDcxNlh3bnJnOFE0cFpGbVJmVFJQQ29ESWsxMmVuY3RcLzNqQWNjeFU3aTZNbkM4MUtWcUlmWWJJbVBKdXJDTXVYc1dHa2x0SE5TK3llNnJvTldLSWN1M1ZFTGY5WFE0cGhnK2crQld6bFloM2g0VUtONlNKWWlUSGtkaHowd0RJYXIrdTlzOE5PaEJPYXdJXC80NEFZcW41RjJqUXNnU3o1TExDSGtuTENuUFppRXllaTNwcVFwRkgweWFWbk03bmQ2RFhrUmVmUExVMTVpMXcwRnpkXC9wWDEiLCJ2IjozLCJpdiI6IkJiVGFjXC9KTG9BU1NYY0tPMkk3M0JBPT0iLCJpYXQiOjE1OTQ1NzIyOTEuODE2fQ.aQm7A6A1R3P94s88vWBWTbIeek9nJ-q9ztfCB7o1uK0';

            const headers = {
                applicationid: 'app.podcast.cosmos',
                'app-version': '1.6.0',
                'x-jike-device-id': device_id,
                'user-agent': 'okhttp/4.7.2',
            };

            const token_updated = await got({
                method: 'post',
                url: 'https://api.xiaoyuzhoufm.com/app_auth_tokens.refresh',
                headers: {
                    ...headers,
                    'x-jike-refresh-token': refresh_token,
                },
            });
            ctx.cache.set('XIAOYUZHOU_TOKEN', token_updated.data['x-jike-refresh-token']);

            const response = await got({
                method: 'post',
                url: 'https://api.xiaoyuzhoufm.com/v1/editor-pick/list',
                headers: {
                    ...headers,
                    'x-jike-access-token': token_updated.data['x-jike-access-token'],
                },
            });

            const data = response.data.data;
            const playList = [];
            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < data[i].picks.length; j++) {
                    data[i].picks[j].episode.pubDate = data[i].date;
                    playList.push(data[i].picks[j]);
                }
            }

            return await Promise.all(
                playList.map(async (item) => {
                    const title = item.episode.title + ' - ' + item.episode.podcast.title;
                    const eid = item.episode.eid;
                    const itunes_item_image = item.episode.image ? item.episode.image.picUrl : item.episode.podcast.image ? item.episode.podcast.image.picUrl : '';
                    const link = `https://www.xiaoyuzhoufm.com/episode/${eid}`;
                    const pubDate = new Date(item.episode.pubDate).toUTCString();
                    const enclosure_length = item.episode.duration;
                    const enclosure_url = item.episode.enclosure.url;
                    const desc = item.episode.shownotes;
                    const author = item.episode.podcast.author;

                    const resultItem = {
                        title: title,
                        description: desc,
                        link: link,
                        author: author,
                        pubDate: pubDate,
                        enclosure_url: enclosure_url,
                        enclosure_length: enclosure_length,
                        itunes_item_image: itunes_item_image,
                        enclosure_type: 'audio/mpeg',
                    };
                    return Promise.resolve(resultItem);
                })
            );
        },
        secondsTillTomorrow()
    );
    ctx.state.data = {
        title: '小宇宙 - 发现',
        link: 'https://www.xiaoyuzhoufm.com/',
        description: '小宇宙的编辑精选',
        image: 'https://www.xiaoyuzhoufm.com/apple-touch-icon.png',
        itunes_author: '小宇宙',
        itunes_category: 'Society & Culture',
        item: resultItems,
    };
};
