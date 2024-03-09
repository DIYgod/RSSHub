import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/lawandrules/:slug?',
    categories: ['finance'],
    example: '/sse/lawandrules',
    parameters: { slug: '见下文，默认为 `latest`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '本所业务指南与流程',
    maintainers: ['nczitzk'],
    handler,
    description: `将目标栏目的网址拆解为 \`https://www.sse.com.cn/lawandrules/guide/\` 和后面的字段，把后面的字段中的 \`/\` 替换为 \`-\`，即为该路由的 slug

  如：（最新指南与流程）\`https://www.sse.com.cn/lawandrules/guide/latest\` 的网址在 \`https://www.sse.com.cn/lawandrules/guide/\` 后的字段是 \`latest\`，则对应的 slug 为 \`latest\`，对应的路由即为 \`/sse/lawandrules/latest\`

  又如：（主板业务指南与流程 - 发行承销业务指南）\`https://www.sse.com.cn/lawandrules/guide/zbywznylc/fxcxywzn\` 的网址在 \`https://www.sse.com.cn/lawandrules/guide/\` 后的字段是 \`zbywznylc/fxcxywzn\`，则对应的 slug 为 \`zbywznylc-fxcxywzn\`，对应的路由即为 \`/sse/lawandrules/zbywznylc-fxcxywzn\``,
};

async function handler(ctx) {
    const slug = ctx.req.param('slug') ?? 'latest';

    const rootUrl = 'https://www.sse.com.cn';
    const currentUrl = `${rootUrl}/lawandrules/guide/${slug.replaceAll('-', '/')}`;
    const response = await got(currentUrl);

    const $ = load(response.data);

    const list = $('.sse_list_1 dl dd')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                link: `${rootUrl}${item.find('a').attr('href')}`,
                pubDate: parseDate(item.find('span').text().trim()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                item.description = content('.allZoom').html();

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
