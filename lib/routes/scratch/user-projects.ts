import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/user-projects/:username',
    categories: ['social-media'],
    example: '/scratch/user-projects/abee',
    parameters: { username: 'Scratch username' },
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
            source: ['scratch.mit.edu/users/:username/projects/'],
            target: '/user-projects/:username',
        },
    ],
    name: 'Scratch User Projects',
    maintainers: ['Skota11'],
    handler: async (ctx) => {
        const { username } = ctx.req.param();

        const limitQuery = ctx.req.query('limit') ?? '40';
        const limit = Math.min(Number.parseInt(limitQuery, 10) || 40, 40);

        const apiUrl = `https://api.scratch.mit.edu/users/${username}/projects/?limit=${limit}`;

        const data = await ofetch(apiUrl);

        const items = data.map((item) => {
            // Description と Instructions を結合。HTMLタグは含まずプレーンテキストのみ。
            const descriptionText = [item.instructions ? `Instructions:\n${item.instructions}` : '', item.description ? `Notes and Credits:\n${item.description}` : ''].filter(Boolean).join('\n\n');

            return {
                title: item.title,
                // 本文（プレーンテキスト）
                description: descriptionText,
                // 公開日（共有日時）
                pubDate: parseDate(item.history.shared),
                link: `https://scratch.mit.edu/projects/${item.id}/`,
                guid: `scratch-project-${item.id}`,
                image: item.image,
                author: username,
            };
        });

        return {
            title: `Scratch User Projects - ${username}`,
            link: `https://scratch.mit.edu/users/${username}/projects/`,
            item: items,
        };
    },
};
