import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const config = {
    recommend: {
        link: 'shots!1!0!0!0!0',
        title: '推荐',
    },
    latest: {
        link: 'shots!2!0!0!0!0',
        title: '最新',
    },
    hot: {
        link: 'shots!3!0!0!0!0',
        title: '热门',
    },
};

export const route: Route = {
    path: '/shots/:caty',
    categories: ['new-media'],
    example: '/meihua/shots/latest',
    parameters: { caty: '分类，见下表' },
    name: '作品',
    maintainers: ['nczitzk'],
    description: `| 最新   | 热门 | 推荐      |
| ------ | ---- | --------- |
| latest | hot  | recommend |`,
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
    const data = JSON.parse(response.match(/"shotsStore":(.*?),"commentStore":/)[1]);

    const shotList = data.shotsData.list.map((item) => ({
        title: item.title,
        link: `https://www.meihua.info/shots/${item.compositionId}`,
        pubDate: parseDate(item.gmtPublish),
    }));

    const items = await Promise.all(
        shotList.map((item) =>
            cache.tryGet(item.link, async () => {
                const contentResponse = await ofetch(item.link);
                const content = load(contentResponse);

                item.description = content('div.summary').html();
                return item;
            })
        )
    );

    return {
        title: `${cfg.title}作品 - 梅花网`,
        link: currentUrl,
        item: items,
    };
}
