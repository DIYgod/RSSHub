import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import NotFoundError from '@/errors/types/not-found';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const categories = {
    '102': 'fggd',
    '150': 'zygc',
    '154': 'zygd',
};

interface Article {
    title: string;
    url: string;
    abstract?: string;
    author?: string;
    display_publish_time?: number;
    publish_time?: number;
    EXT_tags?: string;
}

export const route: Route = {
    path: '/:id?',
    categories: ['new-media'],
    example: '/cdi/150',
    parameters: { id: '分类，见下表，默认为综研国策' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '栏目',
    maintainers: ['nczitzk'],
    handler,
    description: `| 樊纲观点 | 综研国策 | 综研观察 | 综研专访 | 综研视点 | 银湖新能源 |
| -------- | -------- | -------- | -------- | -------- | ---------- |
| 102      | 152      | 150      | 153      | 154      | 151        |

当前官网可以对应到原参数的栏目为 \`102\`、\`150\` 和 \`154\`。原默认栏目 \`152\` 以及 \`153\`、\`151\` 暂无可核实的新栏目地址。`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '152';
    if (['152', '153', '151'].includes(id)) {
        throw new NotFoundError(`Cannot map legacy CDI category ${id} to a verified current category. Available categories: 102, 150, 154.`);
    }
    if (!Object.hasOwn(categories, id)) {
        throw new InvalidParameterError('Available CDI categories: 102, 150, 154.');
    }

    const rootUrl = 'http://www.cdi.org.cn';
    const currentUrl = `${rootUrl}/Research/${categories[id]}/index.html`;
    const page = await ofetch(currentUrl, { responseType: 'text' });
    const $ = load(page);
    const apiPath = $('script')
        .text()
        .match(/['"](\/postmeta\/i\/\d+\.json)['"]/)?.[1];
    if (!apiPath) {
        throw new Error('The CDI category page no longer provides its article API URL.');
    }
    const response = await ofetch<{ category: { name: string }; articles: Article[] }>(new URL(apiPath, rootUrl).href);
    const firstPage = response.articles.toSorted((a, b) => (b.display_publish_time || 0) - (a.display_publish_time || 0)).slice(0, 24);
    const items = await pMap(
        firstPage,
        (article) => {
            const link = new URL(article.url, currentUrl).href;
            return cache.tryGet(link, async (): Promise<DataItem> => {
                const detail = await ofetch(link, { responseType: 'text' });
                const content = load(detail);
                const date = article.display_publish_time || article.publish_time;
                return {
                    title: article.title,
                    link,
                    description: content('#info').html() || article.abstract,
                    author: article.author || undefined,
                    category: article.EXT_tags?.split(',').filter(Boolean),
                    pubDate: date ? parseDate(date, 'X') : undefined,
                };
            });
        },
        { concurrency: 5 }
    );

    return {
        title: `${response.category.name} - 国家高端智库/综合开发研究院`,
        link: currentUrl,
        item: items,
    };
}
