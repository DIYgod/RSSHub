import { Route } from '@/types';
import got from '@/utils/got';
export const route: Route = {
    path: '/data/:category?',
    categories: ['game'],
    example: '/github-advisor/data/composer',
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
            source: ['github.com/advisories', 'github.com'],
        },
    ],
    name: 'Github Advisory Database RSS',
    maintainers: ['sd0ric4'],
    handler,
    description: `| Type | Description | Explanation |
| --- | --- | --- |
| composer | Composer | PHP 依赖管理工具 |
| go | Go | Go 语言包管理工具 |
| maven | Maven | Java 项目管理工具 |
| npm | NPM | Node.js 包管理工具 |
| nuget | NuGet | .NET 包管理工具 |
| pip | Pip | Python 包管理工具 |
| pub | Pub | Dart 包管理工具 |
| rubygems | RubyGems | Ruby 包管理工具 |
| rust | Rust | Rust 包管理工具 |
| erlang | Erlang | Erlang 包管理工具 |
| actions | Actions | GitHub Actions |
| swift | Swift | Swift 包管理工具 |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'composer';

    const apiRootUrl = 'https://azu.github.io/github-advisory-database-rss';
    const apiUrl = `${apiRootUrl}/${category}.json`;
    const currentUrl = `https://github.com/advisories`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.items.map((item) => ({
        author: item.author.name,
        title: item.title,
        link: item.url,
        description: item.content_html,
        pubDate: item.date_publishede,
    }));

    return {
        title: `GitHub Advisory Database RSS - ${category}`,
        link: currentUrl,
        item: items,
    };
}
