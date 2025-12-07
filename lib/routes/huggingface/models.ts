import { load } from 'cheerio';
import MarkdownIt from 'markdown-it';
import { FetchError } from 'ofetch';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const md = MarkdownIt({
    html: true,
});

export const route: Route = {
    path: '/models/:group',
    categories: ['programming'],
    example: '/huggingface/models/deepseek-ai',
    parameters: {
        group: 'The organization or user group name',
    },
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
            source: ['huggingface.co/:group/models'],
            target: '/models/:group',
        },
    ],
    name: 'Group Models',
    maintainers: ['WuNein'],
    handler,
    url: 'huggingface.co',
};

async function handler(ctx) {
    const { group, cycle = 'date' } = ctx.req.param();

    // Validate cycle parameter
    if (!['date', 'week', 'month'].includes(cycle)) {
        throw new Error(`Invalid cycle: ${cycle}`);
    }

    const url = `https://huggingface.co/${group}/models?sort=created`;

    const { body: response } = await got(url);
    const $ = load(response);

    let items = $('article')
        .toArray()
        .map((article) => {
            const $article = $(article);
            const title = $article.find('a > div > header > h4').text().trim();
            const link = `https://huggingface.co/${title}`;
            const timeElement = $article.find('a > div > div > span.truncate > time');
            const datetime = timeElement.attr('datetime');
            const description = $article.text().replaceAll(/\s+/g, ' ').trim();

            return {
                title,
                link,
                description,
                pubDate: datetime ? parseDate(datetime) : undefined,
            };
        })
        .filter((item) => item.title);

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    // 一般有readme, 且没设置权限的模型
                    const { body: detailResp } = await got(item.link + '/raw/main/README.md');

                    item.description += md.render(detailResp);
                    // Qwen一般是外链，主要针对DeepSeek
                    const $Out = load(item.description);
                    $Out('img').each((_, e) => {
                        const $e = $Out(e);

                        const src = $e.attr('src');
                        if (!src) {
                            return;
                        }

                        // 如果不是绝对 URL（没有 http:// 或 https://），添加 base URL
                        if (/^https?:\/\//i.test(src)) {
                            // 已经是完整 URL
                            $e.attr('src', src);
                        } else {
                            // 处理以 / 开头的绝对路径
                            if (src.startsWith('/')) {
                                $e.attr('src', `${item.link}/resolve/main/` + src);
                            } else {
                                // 处理相对路径（如 ./images/pic.png 或 images/pic.png）
                                const baseUrl = item.link + '/resolve/main/';
                                $e.attr('src', baseUrl + src.replace(/^\.\//, ''));
                            }
                        }
                    });
                    item.description = $Out.html();
                    return item;
                } catch (error) {
                    if (error instanceof FetchError && (error.statusCode === 403 || error.statusCode === 401)) {
                        // 要权限的情况
                        // Example: https://huggingface.co/facebook/sam-3d-objects/raw/main/README.md
                        try {
                            // 以免再次出错
                            // 这里可以不管image相对绝对路径，一般要认证的模型都是外链、或者索性图也是403
                            const { body: respHtml } = await got(item.link + '/blob/main/README.md?code=true');
                            const $ = load(respHtml);
                            const detailHtml = $('body').find('div > main > div > section > div > div > div > div > div > table > tbody').text().trim();
                            item.description += md.render(detailHtml);
                            return item;
                        } catch {
                            return item;
                        }
                    } else {
                        // 没有介绍页面的情况 error.statusCode === 404
                        // Example: https://huggingface.co/ianyang02/aita_qwen3-30b/raw/main/README.md
                        // return item;
                        // 其他错误的情况
                        return item;
                    }
                }
            })
        )
    );

    return {
        title: `Huggingface ${group} Models`,
        link: url,
        item: items,
    };
}
