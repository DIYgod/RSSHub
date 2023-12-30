const got = require('@/utils/got');
const { JSDOM } = require('jsdom');

module.exports = {
    getPlayInfo: async (ctx, shareId, ksong_mid = '') => {
        const link = `https://node.kg.qq.com/play?s=${shareId}`;
        const cache_key = ksong_mid ? `ksong:${ksong_mid}` : link;
        const data = await ctx.cache.tryGet(cache_key, async () => {
            const response = await got(link);
            const { window } = new JSDOM(response.data, {
                runScripts: 'dangerously',
            });
            const data = window.__DATA__;
            const name = data.detail.song_name;
            const description = data.detail.content;
            const author = data.detail.nick;
            const itunes_item_image = data.detail.cover;

            const enclosure_url = data.detail.playurl;
            ksong_mid = ksong_mid ? ksong_mid : data.detail.ksong_mid;
            const ctime = data.detail.ctime;
            const comments = data.detail.comments;

            return { name, link, description, author, enclosure_url, ksong_mid, ctime, itunes_item_image, comments };
        });
        return data;
    },
};
