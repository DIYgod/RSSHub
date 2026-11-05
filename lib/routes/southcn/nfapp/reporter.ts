import pMap from 'p-map';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { renderDescription } from '../templates/description';
import { type ArticleSource, parseArticle } from './utils';

export const route: Route = {
    path: '/nfapp/reporter/:reporter',
    categories: ['traditional-media'],
    example: '/southcn/nfapp/reporter/969927791',
    parameters: { reporter: '作者 UUID' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '南方 +（按作者）',
    maintainers: ['TimWu007'],
    handler,
    description: '作者的 UUID 只可通过 `static.nfapp.southcn.com` 下的文章页面获取。点击文章下方的作者介绍，进入该作者的个人主页，即可从 url 中获取。',
};

async function handler(ctx) {
    const reporterId = ctx.req.param('reporter');
    const currentUrl = `https://api.nfnews.com/nanfang_if/reporter/list?reporterUuid=${reporterId}&pageSize=20&pageNo=1&origin=0`;

    const { data: response } = await got(currentUrl);

    const list: ArticleSource[] = response.data.reportInfo.articleInfo.map((item) => ({
        item: {
            title: item.title,
            category: item.releaseColName ? [item.releaseColName] : undefined,
            description: renderDescription({
                thumb: item.picMiddle,
                description: item.attAbstract,
            }),
            pubDate: item.publishtime ? timezone(parseDate(item.publishtime), 8) : undefined,
            link: item.shareUrl,
        },
        articleId: item.fileId,
    }));

    const items = await pMap(list, ({ item, articleId }) => parseArticle(item, articleId), { concurrency: 3 });

    return {
        title: `南方+ - ${response.data.reportInfo.reporterName}`,
        link: `https://static.nfnews.com/apptpl/reporterWorksList/index.html?reporterUuid=${reporterId}`,
        item: items,
    };
}
