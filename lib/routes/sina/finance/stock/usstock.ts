import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { parseArticle } from '../../utils';

export const route: Route = {
    path: '/finance/stock/usstock/:cids?',
    categories: ['new-media'],
    example: '/sina/finance/stock/usstock',
    parameters: { cids: '分区 id，见下表，默认为 `57045`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['finance.sina.com.cn/stock/usstock', 'finance.sina.com.cn/'],
            target: '/finance/stock/usstock',
        },
    ],
    name: '美股',
    maintainers: ['TonyRL'],
    handler,
    url: 'finance.sina.com.cn/stock/usstock',
    description: `| 最新报道 | 中概股 | 国际财经 | 互联网 |
| -------- | ------ | -------- | ------ |
| 57045    | 57046  | 56409    | 40811  |`,
};

async function handler(ctx) {
    const { cids = '57045' } = ctx.req.param();
    const { limit = '50' } = ctx.req.query();
    const { data: response } = await got('https://interface.sina.cn/pc_api/public_news_data.d.json', {
        searchParams: {
            cids,
            pdps: '',
            smartFlow: '',
            editLevel: '0,1,2,3',
            type: 'std_news,std_slide,std_video',
            pageSize: limit,
            cTime: '1483200000',
            tm: Date.now(),
            up: '0',
            action: '0',
            _: Date.now(),
        },
    });
    const list = response.data.map((item) => ({
        title: item.title,
        link: item.url,
        pubDate: parseDate(item.ctime, 'X'),
        author: item.media,
    }));

    const items = await Promise.all(list.map((item) => parseArticle(item, cache.tryGet)));

    return {
        title: '美股|美股行情|美股新闻 - 新浪财经',
        link: 'https://finance.sina.com.cn/stock/usstock/',
        item: items,
    };
}
