import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const handler = async (ctx: Context): Promise<Data> => {
    const limit = Number.parseInt(ctx.req.query('limit') ?? '25', 10);

    const baseUrl = 'https://code.claude.com';
    const targetUrl = `${baseUrl}/docs/en/changelog`;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);

    const items: DataItem[] = $('div.update-container')
        .slice(0, limit)
        .toArray()
        .map((el): DataItem => {
            const $entry = $(el);
            const version = $entry.find('[data-component-part="update-label"]').first().text().trim();
            if (!version) {
                return null as unknown as DataItem;
            }

            const dateText = $entry.find('[data-component-part="update-description"]').first().text().trim();
            const description = $entry.find('[data-component-part="update-content"]').first().html() ?? '';

            const anchor = $entry.attr('id') ?? version.replaceAll('.', '-');
            const link = `${targetUrl}#${anchor}`;

            return {
                title: version,
                description,
                link,
                pubDate: dateText ? parseDate(dateText) : undefined,
                guid: `claude-code-${version}`,
                id: `claude-code-${version}`,
            };
        })
        .filter(Boolean);

    return {
        title: 'Claude Code Changelog',
        description: 'Changelog for Claude Code CLI',
        link: targetUrl,
        item: items,
        allowEmpty: true,
    };
};

export const route: Route = {
    path: '/code/changelog',
    name: 'Code Changelog',
    url: 'code.claude.com',
    maintainers: ['rmaced0'],
    handler,
    example: '/claude/code/changelog',
    categories: ['program-update'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['code.claude.com/docs/en/changelog'],
            target: '/code/changelog',
        },
    ],
};
