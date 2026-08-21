import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://voidstern.net';

export const route: Route = {
    path: '/changelog/:tag?/:page?',
    categories: ['program-update'],
    example: '/voidstern/changelog/fiery-feeds',
    parameters: {
        tag: '标签名称，默认为 fiery-feeds，可选',
        page: '页数，默认为第 1 页，可选',
    },
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
            source: ['voidstern.net/category/changelog'],
            target: '/changelog',
        },
    ],
    name: 'Changelog（更新日志）',
    maintainers: ['AboutRSS'],
    handler,
    description: `| 标签 | 页数 | 1 | 2 |
| :-- | :-: | :-: | :-: |
| 路由 | /voidstern/changelog/fiery-feeds | /voidstern/changelog/fiery-feeds/2 |
| 示例 | Fiery Feeds 更新日志 | 第 2 页 |
| 不带标签 | /voidstern/changelog | /voidstern/changelog/2 |`,
};

async function handler(ctx) {
    const tag = ctx.req.param('tag') ?? 'fiery-feeds';
    const page = Number.parseInt(ctx.req.param('page') ?? '1', 10);
    const pageNumber = Number.isNaN(page) || page < 1 ? 1 : page;

    // 第 1 页为 /category/changelog?tag=xxx，第 N 页为 /category/changelog/page/N?tag=xxx
    const pageUrl = pageNumber === 1 ? `${baseUrl}/category/changelog` : `${baseUrl}/category/changelog/page/${pageNumber}`;
    const currentUrl = `${pageUrl}?tag=${tag}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        },
    });

    const $ = load(response.data);

    const items: DataItem[] = $('ul.wp-block-post-template > li.wp-block-post')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const titleLink = $item.find('.wp-block-post-title a');
            const timeElement = $item.find('.wp-block-post-date time');
            const content = $item.find('.entry-content');

            // 移除 Fediverse Reactions 等交互区块，保留纯正文
            content.find('.wp-block-activitypub-reactions, .wp-block-jetpack-sharing-buttons, .wp-block-group.is-style-compact').remove();

            const result: DataItem = {
                title: titleLink.text().trim(),
                link: titleLink.attr('href') ?? `${currentUrl}`,
                description: content.html() ?? null,
            };
            const datetime = timeElement.attr('datetime');
            if (datetime) {
                result.pubDate = parseDate(datetime);
            }
            return result;
        });

    return {
        title: `${tag} - Changelog - voidstern`,
        link: currentUrl,
        item: items,
    };
}
