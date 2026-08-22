import { load } from 'cheerio';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://voidstern.net';

export const route: Route = {
    path: '/changelog/:tag?',
    categories: ['program-update'],
    example: '/voidstern/changelog/fiery-feeds',
    parameters: {
        tag: '标签名称，默认为 fiery-feeds，可选',
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
    description: `| 标签 | 路由 |
| :-- | :-- |
| 不带标签（默认 fiery-feeds） | /voidstern/changelog |
| fiery-feeds | /voidstern/changelog/fiery-feeds |`,
};

async function handler(ctx) {
    const tag = ctx.req.param('tag') ?? 'fiery-feeds';

    const currentUrl = `${baseUrl}/category/changelog?tag=${tag}`;

    const response = await ofetch(currentUrl, {
        headers: {
            'User-Agent': config.trueUA,
        },
    });

    const $ = load(response);

    const items: DataItem[] = $('ul.wp-block-post-template > li.wp-block-post')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const titleLink = $item.find('.wp-block-post-title a');
            const timeElement = $item.find('.wp-block-post-date time');
            const content = $item.find('.entry-content');

            // Remove interactive blocks (e.g. Fediverse Reactions) and keep only the post body
            content.find('.wp-block-activitypub-reactions, .wp-block-jetpack-sharing-buttons, .wp-block-group.is-style-compact').remove();

            const result: DataItem = {
                title: titleLink.text().trim(),
                link: titleLink.attr('href'),
                description: content.html() ?? undefined,
            };
            const datetime = timeElement.attr('datetime');
            if (datetime) {
                result.pubDate = parseDate(datetime);
            }
            return result;
        });

    return {
        title: `${tag} - Changelog - voidstern`,
        link: `${baseUrl}/category/changelog`,
        item: items,
    };
}
