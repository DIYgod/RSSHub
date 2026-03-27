import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:label?',
    categories: ['new-media'],
    example: '/mygopen',
    parameters: { label: '分類，见下表，默认为首页' },
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
            source: ['mygopen.com/search/label/:label', 'mygopen.com/'],
        },
    ],
    name: '分類',
    maintainers: ['nczitzk'],
    handler,
    description: `| 謠言 | 詐騙 | 真實資訊 | 教學 |
| ---- | ---- | -------- | ---- |`,
};

async function handler(ctx) {
    const label = ctx.req.param('label') ?? '';

    const rootUrl = 'https://www.mygopen.com';
    const currentUrl = `${rootUrl}${label ? `/search/label/${label}` : ''}`;
    const apiUrl = `${rootUrl}/feeds/posts/default${label ? `/-/${label}` : ''}?alt=json-in-script&max-results=${ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = JSON.parse(response.data.match(/gdata\.io\.handleScriptLoaded\((.*)\);/)[1]).feed.entry.map((item) => ({
        title: item.title.$t,
        description: item.content.$t,
        pubDate: parseDate(item.published.$t),
        link: item.link.pop().href,
    }));

    return {
        title: `MyGoPen${label ? `: ${label}` : ''}`,
        link: currentUrl,
        item: items,
        description: '詐騙與謠言頻傳的年代，「MyGoPen｜這是假消息」提醒網路使用者隨時要用謹慎懷疑的態度面對網路上的消息。',
    };
}
