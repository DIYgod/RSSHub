import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/advisor/data/:type?/:category?',
    categories: ['programming'],
    example: '/github/advisor/data/reviewed/composer',
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
    description: `
| Type | Description | Explanation |
| --- | --- | --- |
| reviewed | Reviewed | 已审核 |
| unreviewed | Unreviewed | 未审核 |

| Category | Description | Explanation |
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
    const { category, type } = ctx.req.param();

    const apiRootUrl = 'https://github.com/advisories';
    const apiUrl = `${apiRootUrl}?query=type%3A${type}+ecosystem%3A${category}`;
    const currentUrl = `https://github.com/advisories`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });
    const $ = load(response.data);

    const list = $('div.Box-row')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a.Link--primary');
            const b = item.find('relative-time').attr('datetime');
            const title = a.text() || 'No title';
            const link = a.attr('href') || '#';
            const pubDate = parseDate(b || '');

            return {
                title,
                link: `https://github.com${link}`,
                pubDate,
                description: '',
            };
        });
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                item.description = $('.comment-body').first().html() || '';

                return item;
            })
        )
    );
    return {
        title: `GitHub Advisory Database RSS - ${category} - ${type}`,
        link: currentUrl,
        item: items,
    };
}
