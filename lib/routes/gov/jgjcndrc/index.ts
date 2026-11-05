import { load } from 'cheerio';

import type { Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const handler = async (ctx) => {
    const { columnId = '1832739866673426433', subColumnId } = ctx.req.param();
    const limit = getRouteLimit(ctx, 30);
    // Article timestamps can refine the dates on the first list page.
    const candidateLimit = ctx.req.query('sorted') === 'false' ? limit : Math.max(30, limit);

    const rootUrl = 'https://www.jgjcndrc.org.cn';
    const currentUrl = new URL(`list?clmId=${columnId}${subColumnId ? `&sclmId=${subColumnId}` : ''}`, rootUrl).href;
    const apiColumnUrl = new URL(`prod-api/portal/artPageByColumn/${subColumnId ?? columnId}`, rootUrl).href;

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const language = $('html').prop('lang') as Language;

    const { data: response } = await got(apiColumnUrl, {
        searchParams: {
            pageNum: 1,
            pageSize: candidateLimit,
        },
    });

    let items = response.data.slice(0, candidateLimit).map((item) => {
        const guid = `jgjcndrc-${item.articleId}`;

        return {
            title: item.articleTitle,
            pubDate: item.pubDate ? timezone(parseDate(item.pubDate), 8) : undefined,
            link: new URL(`prod-api/portal/article/${item.articleId}`, rootUrl).href,
            guid,
            id: guid,
            language,
        };
    });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const data = detailResponse.data;

                const title = data.articleTitle;
                const description = data.articleContent;
                const guid = `jgjcndrc-${data.articleId}`;

                item.title = title;
                item.description = description;
                item.pubDate = data.pubDate ? timezone(parseDate(data.pubDate), 8) : item.pubDate;
                item.link = data.linkUrl || new URL(data.articleUrl, rootUrl).href;
                item.category = data.parentColumns?.map((c) => c.columnName);
                item.guid = guid;
                item.id = guid;
                item.content = {
                    html: description,
                    text: description ? load(description).text() : undefined,
                };
                item.language = language;

                return item;
            })
        )
    );

    const imageSource = $('header img').last().prop('src');
    const image = imageSource ? new URL(imageSource, rootUrl).href : undefined;

    return {
        title: `${$('title').text()}${$('div.tit').text() ? ` - ${$('div.tit').text()}` : ''}`,
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        image,
        author: $('header h1').text(),
        language,
    };
};

export const route: Route = {
    path: '/:columnId?/:subColumnId?',
    name: '通用',
    url: 'www.jgjcndrc.org.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/gov/jgjcndrc/1832739866673426433',
    parameters: {
        columnId: '栏目 id，默认为 `1832739866673426433`，即通知公告，可在对应栏目页 URL 中找到',
        subColumnId: '子栏目 id，默认为空，可在对应子栏目页 URL 中找到',
    },
    description: `::: tip
若订阅 [通知公告](https://www.jgjcndrc.org.cn/list?clmId=1832739866673426433)，网址为 \`https://www.jgjcndrc.org.cn/list?clmId=1832739866673426433\`。截取 \`clmId\` 的参数部分 \`1832739866673426433\` 作为参数填入，此时路由为 [\`/gov/jgjcndrc/1832739866673426433\`](https://rsshub.app/gov/jgjcndrc/1832739866673426433)。

若订阅 [国内外市场价格监测情况周报](https://www.jgjcndrc.org.cn/list?clmId=1832298113994649601\\&sclmId=1832751799531220993)，网址为 \`https://www.jgjcndrc.org.cn/list?clmId=1832298113994649601&sclmId=1832751799531220993\`。截取 \`clmId\` 和 \`sclmId\` 的参数部分 \`1832298113994649601\` 和 \`1832751799531220993\` 作为参数填入，此时路由为 [\`/gov/jgjcndrc/1832298113994649601/1832751799531220993\`](https://rsshub.app/gov/jgjcndrc/1832298113994649601/1832751799531220993)。
:::`,
    categories: ['government'],

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
            source: ['www.jgjcndrc.org.cn/list'],
            target: (_, url) => {
                const { searchParams } = new URL(url);
                const columnId = searchParams.get('clmId');
                const subColumnId = searchParams.get('sclmId');

                return columnId ? `/${columnId}${subColumnId ? `/${subColumnId}` : ''}` : '/';
            },
        },
    ],
};
