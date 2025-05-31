import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import utils from './utils';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/special/:id',
    categories: ['new-media'],
    example: '/dongqiudi/special/41',
    parameters: { id: '专题 id, 可自行通过 https://www.dongqiudi.com/special/+数字匹配' },
    radar: [
        {
            source: ['www.dongqiudi.com/special/:id'],
        },
    ],
    name: '专题',
    maintainers: ['dxmpalb'],
    handler,
    description: `| 新闻大爆炸 | 懂球帝十佳球 | 懂球帝本周 MVP |
| ---------- | ------------ | -------------- |
| 41         | 52           | 53             |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const { data: response } = await got(`https://www.dongqiudi.com/api/old/columns/${id}`);

    const list = response.data.map((item) => ({
        title: item.title,
        link: `https://www.dongqiudi.com/articles/${item.aid}.html`,
        mobileLink: `https://m.dongqiudi.com/article/${item.aid}.html`,
        pubDate: parseDate(item.show_time, 'X'),
    }));

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.mobileLink);

                utils.ProcessFeedType3(item, response);

                return item;
            })
        )
    );

    return {
        title: `懂球帝专题-${response.title}`,
        description: response.description,
        link: `https://www.dongqiudi.com/special/${id}`,
        item: out.filter(Boolean),
    };
}
