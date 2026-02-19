import MarkdownIt from 'markdown-it';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/funded/:username/:repo',
    categories: ['programming'],
    example: '/issuehunt/funded/DIYgod/RSSHub',
    parameters: { username: 'Github user/org', repo: 'Repository name' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Project Funded',
    maintainers: ['running-grass'],
    handler,
};

async function handler(ctx) {
    const { username, repo } = ctx.req.param();
    const response = await got(`https://issuehunt.io/apis/pages/repos/show?repositoryOwnerName=${username}&repositoryName=${repo}`);

    const { issues } = response.data;
    if (issues === undefined) {
        throw new Error('没有获取到数据');
    }

    const md = MarkdownIt({
        html: true,
    });
    return {
        title: `Issue Hunt 的悬赏 -- ${username}/${repo}`,
        link: `https://issuehunt.io/r/${username}/${repo}`,
        description: ``,
        item: issues.map((item) => ({
            title: item.title,
            description: md.render(item.body),
            pubDate: item.fundedAt,
            link: `https://issuehunt.io/r/${username}/${repo}/issues/${item.number}`,
            author: item.userName,
        })),
    };
}
