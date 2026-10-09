import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const sectionId = '360001185332';

export const route: Route = {
    path: '/bedrock/preview',
    categories: ['game'],
    example: '/minecraft/bedrock/preview',
    name: 'Bedrock Beta and Preview changelogs',
    maintainers: ['DIYgod'],
    radar: [
        {
            source: ['feedback.minecraft.net/hc/en-us/sections/360001185332-Beta-and-Preview-Information-and-Changelogs'],
            target: '/bedrock/preview',
        },
    ],
    handler,
};

async function handler() {
    const response = await ofetch(`https://feedback.minecraft.net/api/v2/help_center/en-us/sections/${sectionId}/articles.json`, {
        query: { sort_by: 'created_at', sort_order: 'desc' },
    });
    return {
        title: 'Minecraft Bedrock - Beta and Preview changelogs',
        link: `https://feedback.minecraft.net/hc/en-us/sections/${sectionId}-Beta-and-Preview-Information-and-Changelogs`,
        item: response.articles.map((article) => {
            const $ = load(article.body, null, false);
            $('p')
                .filter((_, paragraph) => $(paragraph).find('strong').first().text().startsWith('Posted:'))
                .remove();
            return {
                title: article.title,
                link: article.html_url,
                description: $.html(),
                pubDate: parseDate(article.created_at),
                category: article.label_names,
            };
        }),
    };
}
