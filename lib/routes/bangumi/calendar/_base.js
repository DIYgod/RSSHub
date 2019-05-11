const axios = require('../../../utils/axios');

/** @type { (timezoneOffset: number) => Date } */
const tomorrowMidnight = (timezoneOffset) => {
    const result = new Date(Date.now());
    const localHour = result.getHours() + timezoneOffset;
    if (localHour < 0) {
        result.setUTCHours(-timezoneOffset, 0, 0, 0);
    } else if (localHour < 24) {
        result.setUTCHours(24 - timezoneOffset, 0, 0, 0);
    } else {
        result.setUTCHours(48 - timezoneOffset, 0, 0, 0);
    }
    return result;
};

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
                const response = await axios({
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

                ctx.cache.set(url[i], JSON.stringify(data), tomorrowMidnight(8).getTime() - Date.now());
                return Promise.resolve(data);
            }
        })
    );

    return result;
};
