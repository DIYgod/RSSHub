import { config } from '@/config';
import cache from '@/utils/cache';
import got from '@/utils/got';

export const getData = () => {
    const bgmCalendarUrl = 'https://api.bgm.tv/calendar';
    const bgmDataUrl = 'https://cdn.jsdelivr.net/npm/bangumi-data/dist/data.json';

    const urls = [bgmCalendarUrl, bgmDataUrl];

    return Promise.all(
        urls.map((item, i) =>
            cache.tryGet(
                item,
                async () => {
                    const { data } = await got(item);

                    if (i === 1) {
                        // 只保留有 bangumi id 的番剧
                        const items = data.items
                            .map((item) => {
                                const bgmSite = item.sites.find((s) => s.site === 'bangumi');
                                return bgmSite ? { ...item, bgmId: bgmSite.id } : null;
                            })
                            .filter(Boolean);
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
