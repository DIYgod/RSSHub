import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import queryString from 'query-string';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/mmda/tags/:tags?',
    categories: ['picture'],
    example: '/booru/mmda/tags/full_body%20blue_eyes',
    parameters: { tags: '标签，多个标签使用 `%20` 连接，如需根据作者查询则在 `user:` 后接上作者名，如：`user:xxxx`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['mmda.booru.org/index.php'],
        },
    ],
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

            const title = a.find('img').first().attr('title') ?? '';
            const imageSrc = a.find('img').first().attr('src') ?? '';

            return {
                title,
                link: `${baseUrl}/${a.attr('href')}`,
                image: imageSrc,
                author: user,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    title,
                    image: imageSrc,
                    by: user,
                }),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                // 获取左侧的Statistics统计信息
                const statisticsTages = $('#tag_list > ul');
                statisticsTages.find('li, br, strong').remove();
                const statisticsStr = statisticsTages.text();

                const regex = /(?<key>[^\s:]+)\s*:\s*(?<value>.+)/gm;
                const result = {};
                for (const match of statisticsStr.matchAll(regex)) {
                    const { key, value } = match.groups ?? ({} as { key: string; value: string });
                    result[key.trim().toLocaleLowerCase()] = value.trim();
                }

                // 获取大图
                const bigImage = $('#image').attr('src');

                // 获取发布时间
                if (result.posted) {
                    item.pubDate = parseDate(result.posted);
                }

                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    title: item.title,
                    image: bigImage ?? item.image,
                    posted: item.pubDate ?? '',
                    by: result.by,
                    source: result.source,
                    rating: result.rating,
                    score: result.score,
                });

                return item;
            })
        )
    );

    return {
        title: tags,
        link: `${baseUrl}/index.php?${query}`,
        item: items,
    };
}
