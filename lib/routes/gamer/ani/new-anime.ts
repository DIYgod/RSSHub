// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const rootUrl = 'https://ani.gamer.com.tw';
    const { data: response } = await got('https://api.gamer.com.tw/mobile_app/anime/v3/index.php');

    const items = response.data.newAnime.date.map((item) => ({
        title: `${item.title} ${item.volume}`,
        description: `<img src="${item.cover}">`,
        link: `${rootUrl}/animeVideo.php?sn=${item.videoSn}`,
        pubDate: timezone(parseDate(`${item.upTime} ${item.upTimeHours}`, 'MM/DD HH:mm'), +8),
    }));

    ctx.set('data', {
        title: '動畫瘋最後更新',
        link: rootUrl,
        item: items,
    });
};
