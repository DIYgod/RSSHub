import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/home',
    categories: ['new-media'],
    example: '/nosetime/home',
    name: '首页',
    maintainers: ['kt286'],
    handler,
};

async function handler() {
    const link = 'https://www.nosetime.com/perfume.php';

    const response = await ofetch('https://www.nosetime.com/app/smart.php?page=1&type=discovery', {
        headers: {
            Referer: link,
        },
        responseType: 'json',
    });

    return {
        title: '香水时代',
        link,
        description: '最新香水评论|发现香水圈的新鲜事 - 香水时代NoseTime.com',
        item: response.items.map((item) => ({
            title: `${'★★★★★☆☆☆☆☆'.slice(5 - item.uwscore, 10 - item.uwscore)} ${item.ifullname}`,
            description: item.udcontent,
            pubDate: parseDate(item.uface * 1000),
            link: `https://www.nosetime.com/xiangshui/${item.iid}-${item.iurl}.html`,
            author: item.uname,
        })),
    };
}
