// @ts-nocheck
import got from '@/utils/got';
import { config } from '@/config';

module.exports = (tryGet) => {
    const bgmCalendarUrl = 'https://api.bgm.tv/calendar';
    const bgmDataUrl = 'https://cdn.jsdelivr.net/npm/bangumi-data/dist/data.json';

    const urls = [bgmCalendarUrl, bgmDataUrl];

    return Promise.all(
        urls.map((item, i) =>
            tryGet(
                item,
                async () => {
                    const { data } = await got(item);

                    if (i === 1) {
                        // 只保留有 bangumi id 的番剧
                        const items = [];
                        for (const item of data.items) {
                            const bgmSite = item.sites.find((s) => s.site === 'bangumi');
                            if (bgmSite) {
                                item.bgmId = bgmSite.id;
                                items.push(item);
                            }
                        }
                        data.items = items;
                    }

                    return data;
                },
                config.cache.contentExpire,
                false
            )
        )
    );
};
