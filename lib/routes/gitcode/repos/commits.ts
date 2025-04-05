import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import MarkdownIt from 'markdown-it';

const md = MarkdownIt({
    html: true,
});

export const route: Route = {
    path: '/commits/:owner/:repo/:branch?',
    categories: ['programming'],
    example: '/gitcode/commits-api/openharmony-sig/flutter_flutter',
    parameters: { owner: '用户名/组织名', repo: '仓库名', branch: '分支名，可选，默认为主分支' },
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
            source: ['gitcode.com/:owner/:repo/commits', 'gitcode.com/:owner/:repo/commits/:branch'],
            target: (params) => `/gitcode/commits/${params.owner}/${params.repo}${params.branch ? `/${params.branch}` : ''}`,
        },
    ],
    name: '仓库提交',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const { owner, repo, branch } = ctx.req.param();
    // API路径
    const apiUrl = `https://web-api.gitcode.com/api/v2/projects/${encodeURIComponent(owner)}%2F${encodeURIComponent(repo)}/repository/commits`;

    const searchParams: Record<string, any> = {
        per_page: ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 100,
    };

    // 如果指定了分支，则添加到查询参数中
    if (branch) {
        searchParams.ref_name = branch;
    }

    const response = (await cache.tryGet(`${apiUrl}${branch ? `#${branch}` : ''}`, async () => {
        const { data } = await got(apiUrl, {
            searchParams,
        });
        return data;
    })) as { content: any[] };

    if (!response || !response.content) {
        throw new Error('无法获取提交数据');
    }

    const items = response.content.map((item) => ({
        title: md.renderInline(item.title),
        description: md.render(item.message),
        author: item.author_name,
        pubDate: parseDate(item.committed_date),
        guid: item.id,
        link: `https://gitcode.com/${owner}/${repo}/commit/${item.id}`,
    }));

    const branchText = branch ? ` (${branch})` : '';
    return {
        title: `${owner}/${repo}/${branchText} - 提交记录`,
        link: `https://gitcode.com/${owner}/${repo}/commits/${branch || ''}`,
        item: items,
    };
}
