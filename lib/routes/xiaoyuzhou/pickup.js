const got = require('@/utils/got');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const device_id = config.xiaoyuzhou.device_id || 'f5d56d9a-8530-49a4-a6d2-cfb4b7a31240';
    const cache = await ctx.cache.get('XIAOYUZHOU_TOKEN');
    let refresh_token =
        cache ||
        config.xiaoyuzhou.refresh_token ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiN2FxSkRJdFpKKytcL0N6REhiUldDRThcL3V1eGFDZmN4NUs2cWJCUXlqdU5RekcyWVBrR1pNT2x2NkJRTTNRdVdcL01BajRGdkNqbUYwcDF4eWZuNmlTMXlmS1lQVU41Z3ljbXVUUkZIcHpnaDlKWllUNkpyYVNxQVlVcG4wNnZjcnlmQkRVTlZwYlFIcmFpZ1VRWitsS3NRRXE5c1A3bnhqVmhPQ1pCWTdjdzdRbkFVaDF3bXhiZ09maHc5czNqUEE4b0pTYXNhRDh5SmlkaFdDdGJKeUJ3eVZUODByRlV0Rll0YTdcL0J1K2p6Um1SZjZjc28zQ05qcGxsbDlWWTlwTDIiLCJ2IjozLCJpdiI6InhFWVhKRjNYUEZiY05tUEZUZkR5dXc9PSIsImlhdCI6MTU5NDI1NDE5Mi44NzV9.AAZ32yHxkFk4qwspl9_NeG4nlSDCaslHUP7YE1BwSD8';

    const get_token = await got({
        method: 'post',
        url: `https://api.xiaoyuzhoufm.com/app_auth_tokens.refresh`,
        headers: {
            Host: `api.xiaoyuzhoufm.com`,
            applicationid: `app.podcast.cosmos`,
            'app-version': '1.6.0',
            'x-jike-device-id': device_id,
            'x-jike-refresh-token': refresh_token,
            'user-agent': 'okhttp/4.7.2',
        },
    });

    refresh_token = get_token.data['x-jike-refresh-token'];
    ctx.cache.set('XIAOYUZHOU_TOKEN', refresh_token);

    const access_token = get_token.data['x-jike-access-token'];

    const response = await got({
        method: 'post',
        url: `https://api.xiaoyuzhoufm.com/v1/editor-pick/list`,
        headers: {
            Host: `api.xiaoyuzhoufm.com`,
            applicationid: `app.podcast.cosmos`,
            'app-version': '1.6.0',
            'x-jike-device-id': device_id,
            'x-jike-access-token': access_token,
            'user-agent': 'okhttp/4.7.2',
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

    const resultItems = await Promise.all(
        playList.map(async (item) => {
            const title = item.episode.title + ' - ' + item.episode.podcast.title;
            const eid = item.episode.eid;
            const itunes_item_image = item.episode.image ? item.episode.image.picUrl : '';
            const link = 'https://www.xiaoyuzhoufm.com/episode/' + eid;
            const pubDate = new Date(item.episode.pubDate).toUTCString();
            const enclosure_length = item.episode.duration;
            const enclosure_url = item.episode.enclosure.url;
            const desc = item.episode.shownotes;
            const author = item.episode.podcast.author;

            const resultItem = {
                title: title,
                description: desc,
                link: link,
                guid: link,
                author: author,
                pubDate: pubDate,
                enclosure_url: enclosure_url,
                enclosure_length: enclosure_length,
                itunes_item_image: itunes_item_image,
            };
            return Promise.resolve(resultItem);
        })
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
