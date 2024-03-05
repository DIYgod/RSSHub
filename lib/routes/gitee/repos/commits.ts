// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';
const md = require('markdown-it')({
    html: true,
});

export default async (ctx) => {
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

    ctx.set('data', {
        title: `${owner}/${repo} - 提交`,
        link: `https://gitee.com/${owner}/${repo}/commits`,
        item: items,
    });
};
