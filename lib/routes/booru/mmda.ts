import { Route } from '@/types';
import got from '@/utils/got';
import queryString from 'query-string';
import { load } from 'cheerio';

export const route: Route = {
    path: '/mmda/tags/:tags?',
    categories: ['picture'],
    example: '/booru/mmda/tags/full_body+blue_eyes',
    parameters: { tags: '标签，多个标签使用空格 ` ` 或者 `%20` 连接，如需根据作者查询则在 `user:` 后接上作者名，如：`user:xxxx`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'MMDArchive 标签查询',
    maintainers: ['N78Wy'],
    handler,
    description: `For example:

  -   默认查询 (什么 tag 都不加)：\`/booru/mmda/tags\`
  -   默认查询单个 tag：\`/booru/mmda/tags/full_body\`
  -   默认查询多个 tag：\`/booru/mmda/tags/full_body%20blue_eyes\`
  -   默认查询根据作者查询：\`/booru/mmda/tags/user:xxxx\``,
};

async function handler(ctx) {
    const baseUrl = 'https://mmda.booru.org';
    const tags = ctx.req.param('tags');

    const query = queryString.stringify(
        {
            tags,
            page: 'post',
            s: 'list',
        },
        {
            skipNull: true,
        }
    );

    const { data: response } = await got(`${baseUrl}/index.php`, {
        searchParams: query,
    });

    const $ = load(response);
    const list = $('#post-list > div.content > div > div:nth-child(3) span')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();

            const scriptStr = item.find('script[type="text/javascript"]').first().text();
            const user = scriptStr.match(/user':'(.*?)'/)?.[1] ?? '';

            return {
                title: a.find('img').first().attr('title'),
                link: `${baseUrl}/${a.attr('href')}`,
                author: user,
                description: a.html(),
            };
        });

    return {
        title: tags,
        link: `${baseUrl}/index.php?${query}`,
        item: list,
    };
}
