import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const config = {
    latest: {
        link: 'article!2',
        title: '最新',
    },
    hot: {
        link: 'article!3',
        title: '热门',
    },
};

export const route: Route = {
    path: '/article/:caty',
    categories: ['new-media'],
    example: '/meihua/article/latest',
    parameters: { caty: '分类，见下表' },
    name: '文章',
    maintainers: ['nczitzk'],
    description: `| 最新   | 热门 |
| ------ | ---- |
| latest | hot  |`,
    handler,
};

async function handler(ctx: Context) {
    const { caty } = ctx.req.param();
    const cfg = config[caty];
    if (!cfg) {
        throw new InvalidParameterError(`Bad category: ${caty}`);
    }

    const currentUrl = `https://www.meihua.info/${cfg.link}`;
    const response = await ofetch(currentUrl);
    const data = JSON.parse(response.match(/"compositionStore":(.*?),"detailStore":/)[1]);

    const shotList = data.compositionsData.list.map((item) => ({
        title: item.title,
        link: `https://www.meihua.info/article/${item.compositionId}`,
        pubDate: parseDate(item.gmtPublish),
    }));

    const items = await Promise.all(
        shotList.map((item) =>
            cache.tryGet(item.link, async () => {
                const contentResponse = await ofetch(item.link);
                const content = load(contentResponse);

                item.description = content('#article-content-html').html();
                return item;
            })
        )
    );

    return {
        title: `${cfg.title}文章 - 梅花网`,
        link: currentUrl,
        item: items,
    };
}
