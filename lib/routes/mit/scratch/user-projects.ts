import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/scratch/user-projects/:username',
    categories: ['social-media'],
    example: '/mit/scratch/user-projects/abee',
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
            target: '/scratch/user-projects/:username',
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
            const parts = [item.instructions ? `Instructions:<br>${item.instructions}` : '', item.description ? `Notes and Credits:<br>${item.description}` : ''].filter(Boolean);
            const descriptionText = parts.join('<br><br>').replaceAll('\n', '<br>');

            return {
                title: item.title,
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
