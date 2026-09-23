import { load } from 'cheerio';

import type { Route } from '@/types';

import { baseUrl, fetchListing, parseSearchListing, resolvePubDate } from './utils';

async function handler(ctx) {
    const { params } = ctx.req.param();
    const searchParams = new URLSearchParams(params || '');
    const link = `${baseUrl}/search${searchParams.toString() ? `?${searchParams}` : ''}`;

    const query = searchParams.get('query') || '';
    const genre = searchParams.get('genre') || '';
    const date = searchParams.get('date') || '';
    const requestedDate = /(\d{4})\s*年\s*(\d{1,2})\s*月/.exec(date);

    const { html, status } = await fetchListing(link);
    if (status >= 400) {
        throw new Error(`Hanime1 responded with HTTP ${status}, unable to load the search result: ${link}`);
    }

    const $ = load(html);
    const item = parseSearchListing($).map((entry) => ({
        title: entry.title,
        link: entry.link,
        description: entry.description,
        pubDate: resolvePubDate(entry.dateText, requestedDate ? Number(requestedDate[1]) : undefined, requestedDate ? Number(requestedDate[2]) : undefined),
    }));

    const feedTitle = ['Hanime1 搜索结果', genre && `类型: ${genre}`, query && `关键词: ${query}`, date && `时间: ${date}`].filter(Boolean).join(' | ');

    return {
        title: feedTitle,
        link,
        item,
    };
}

export const route: Route = {
    path: '/search/:params',
    name: '搜索结果',
    maintainers: ['kjasn'],
    example: '/hanime1/search/genre=%E6%96%B0%E7%95%AA%E9%A0%90%E5%91%8A',
    categories: ['anime'],
    parameters: {
        params: {
            description: `
把原网址 \`/search?\` 后面的部分原样接在路由后面即可，参数名与原网址一致。

| 参数       | 说明         | 示例或可选值                                                          |
| ---------- | ------------ | --------------------------------------------------------------------- |
| \`query\`  | 搜索关键词   | \`辣妹\`                                                              |
| \`genre\`  | 番剧类型     | \`裏番\` / \`泡麵番\` / \`Motion+Anime\` / \`3D動畫\` / \`新番預告\` 等 |
| \`type\`   | 内容类型     | \`artist\` 等，见原网址                                               |
| \`tags[]\` | 标签，可重复 | \`tags[]=純愛&tags[]=中文字幕\`                                       |
| \`sort\`   | 排序         | \`最新上市\` / \`最新上傳\` / \`本日排行\` 等                          |
| \`date\`   | 发布时间筛选 | \`2026 年 9 月\`                                                      |
| \`duration\` | 时长筛选   | 见原网址                                                              |

::: tip
在原网址选好筛选条件后，把网址中 \`/search?\` 之后的部分复制过来即可，例如
\`https://rsshub.app/hanime1/search/genre=%E6%96%B0%E7%95%AA%E9%A0%90%E5%91%8A&date=2026%20%E5%B9%B4%209%20%E6%9C%88\`
:::
`,
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    handler,
};
