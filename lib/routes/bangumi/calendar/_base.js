const got = require('@/utils/got');

module.exports = async (ctx) => {
    const bgmCalendarUrl = 'https://api.bgm.tv/calendar';
    const bgmDataUrl = 'https://cdn.jsdelivr.net/npm/bangumi-data/dist/data.json';

    const url = [bgmCalendarUrl, bgmDataUrl];

    const cache = await Promise.all(url.map(ctx.cache.get));
    const result = await Promise.all(
        cache.map(async (c, i) => {
            if (c) {
                return Promise.resolve(JSON.parse(c));
            } else {
                const response = await got({
                    method: 'get',
                    url: url[i],
                });
                const data = response.data;

                if (i === 1) {
                    // 只保留有 bangumi id 的番剧
                    const length = data.items.length;
                    const items = [];
                    for (let index = 0; index < length; index++) {
                        const item = data.items[index];
                        const bgm_site = item.sites.find((s) => s.site === 'bangumi');
                        if (bgm_site) {
                            item.bgm_id = bgm_site.id;
                            items.push(item);
                        }
                    }
                    data.items = items;
                }

                ctx.cache.set(url[i], JSON.stringify(data));
                return Promise.resolve(data);
            }
        })
    );

    return result;
};
