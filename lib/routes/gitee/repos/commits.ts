import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';
import MarkdownIt from 'markdown-it';
const md = MarkdownIt({
    html: true,
});

export const route: Route = {
    path: '/commits/:owner/:repo',
    categories: ['programming'],
    example: '/gitee/commits/y_project/RuoYi',
    parameters: { owner: '用户名', repo: '仓库名' },
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
            source: ['gitee.com/:owner/:repo/commits'],
        },
    ],
    name: '仓库提交',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { owner, repo } = ctx.req.param();

    const apiUrl = `https://gitee.com/api/v5/repos/${owner}/${repo}/commits`;
    const response = await cache.tryGet(
        apiUrl,
        async () =>
            (
                await got(apiUrl, {
                    searchParams: {
                        access_token: config.gitee.access_token ?? undefined,
                        per_page: ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 100,
                        direction: 'desc',
                    },
                })
            ).data
    );

    const items = response.map((item) => ({
        title: md.renderInline(item.commit.message),
        description: md.render(item.commit.message),
        author: item.author?.login || item.commit.author.name,
        pubDate: parseDate(item.commit.author.date),
        guid: item.sha,
        link: item.html_url,
    }));

    return {
        title: `${owner}/${repo} - 提交`,
        link: `https://gitee.com/${owner}/${repo}/commits`,
        item: items,
    };
}
