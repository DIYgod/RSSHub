import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import { getMimeType } from 'hono/utils/mime';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

const documentMimeTypes = {
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};
const getEnclosureType = (link: string) => {
    const pathname = new URL(link).pathname;
    return (getMimeType(pathname) ?? getMimeType(pathname, documentMimeTypes))?.split(';', 1)[0];
};

const renderDescription = ({ images, description }) =>
    renderToString(
        <>
            {images?.length
                ? images.map((image) =>
                      image?.src ? (
                          <figure key={image.src}>
                              <img src={image.src} alt={image.alt} />
                          </figure>
                      ) : null
                  )
                : null}
            {description ? <>{raw(description)}</> : null}
        </>
    );
export const handler = async (ctx) => {
    const { category = 'fgw_zxxxgk' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 20);

    const rootUrl = 'https://fgw.sh.gov.cn';
    const currentUrl = `${rootUrl}/${category}/index.html`;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang') as Language;

    let items = $('ul.nowrapli li')
        .slice(0, ctx.req.query('sorted') === 'false' ? limit : Math.max(20, limit))
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const date = $item.find('span.time').text().trim();
            const pubDate = date ? timezone(parseDate(date, 'YYYY-MM-DD', true), 8) : undefined;

            return {
                title: $item.find('a').prop('title')!,
                pubDate: pubDate && Number.isFinite(pubDate.getTime()) ? pubDate : undefined,
                link: new URL($item.find('a').prop('href')!, rootUrl).href,
                language,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link!, async () => {
                if (!item.link!.endsWith('.html')) {
                    item.enclosure_url = item.link;
                    item.enclosure_type = getEnclosureType(item.link!);
                    item.enclosure_title = item.title;

                    return item;
                }

                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('meta[name="ArticleTitle"]').prop('content');
                const imageUrl = $$('div.pdf-content img').prop('src');
                const image = imageUrl ? new URL(imageUrl, item.link).href : undefined;
                const description = renderDescription({
                    images: image
                        ? [
                              {
                                  src: image,
                                  alt: title,
                              },
                          ]
                        : undefined,
                    description: $$('div#ivs_content').html(),
                });

                item.title = title;
                item.description = description;
                const date = $$('meta[name="PubDate"]').prop('content')?.replaceAll('∶', ':');
                const pubDate = date ? timezone(parseDate(date, ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm'], true), 8) : undefined;
                item.pubDate = pubDate && Number.isFinite(pubDate.getTime()) ? pubDate : item.pubDate;
                item.category = [...new Set([$$('meta[name="ColumnName"]').prop('content'), $$('meta[name="ColumnKeywords"]').prop('content')])].filter(Boolean);
                item.author = $$('meta[name="ContentSource"]').prop('content');
                item.content = {
                    html: description,
                    text: $$('div#ivs_content').text(),
                };
                item.image = image;
                item.banner = image;
                item.language = language;

                const enclosureUrl = $$('div.pdf-content a, div.xgfj a').prop('href');

                item.enclosure_url = enclosureUrl ? new URL(enclosureUrl, item.link).href : undefined;
                item.enclosure_type = item.enclosure_url ? getEnclosureType(item.enclosure_url) : undefined;
                item.enclosure_title = title;

                return item;
            })
        )
    );

    if (ctx.req.query('sorted') !== 'false' && items.every((item) => item.pubDate instanceof Date && Number.isFinite(item.pubDate.getTime()))) {
        items.sort((a, b) => (b.pubDate as Date).getTime() - (a.pubDate as Date).getTime());
        items = items.slice(0, limit);
    }

    const author = $('meta[name="SiteName"]').prop('content');
    const imageUrl = $('span.logo-icon img').prop('src');
    const image = imageUrl ? new URL(imageUrl, currentUrl).href : undefined;

    return {
        title: `${author} - ${$('meta[name="ColumnName"]').prop('content')}`,
        description: $('meta[name="ColumnDescription"]').prop('content'),
        link: currentUrl,
        item: items,
        image,
        author,
        language,
    };
};

export const route: Route = {
    path: '/fgw/:category{.+}?',
    name: '发展和改革委员会',
    url: 'fgw.sh.gov.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/gov/sh/fgw/fgw_zxxxgk',
    parameters: { category: '分类，默认为 `fgw_zxxxgk`，即最新信息公开，可在对应分类页 URL 中找到' },
    description: `::: tip
若订阅 [最新信息公开](https://fgw.sh.gov.cn/fgw_zxxxgk/index.html)，网址为 \`https://fgw.sh.gov.cn/fgw_zxxxgk/index.html\`。截取 \`https://fgw.sh.gov.cn/\` 到末尾 \`/index.html\` 的部分 \`fgw_zxxxgk\` 作为参数填入，此时路由为 [\`/gov/sh/fgw/fgw_zxxxgk\`](https://rsshub.app/gov/sh/fgw/fgw_zxxxgk)。
:::

| 最新信息公开 | 要闻动态    |
| ------------ | ----------- |
| fgw\\_zxxxgk  | fgw\\_fzggdt |`,
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
            source: ['fgw.sh.gov.cn/'],
            target: '/fgw',
        },
        {
            source: ['fgw.sh.gov.cn/fgw_zxxxgk/index.html'],
            target: '/fgw/fgw_zxxxgk',
        },
        {
            source: ['fgw.sh.gov.cn/fgw_fzggdt/index.html'],
            target: '/fgw/fgw_fzggdt',
        },
        {
            source: ['fgw.sh.gov.cn/fgw_jggl/index.html'],
            target: '/fgw/fgw_jggl',
        },
        {
            source: ['fgw.sh.gov.cn/fgw_ny/index.html'],
            target: '/fgw/fgw_ny',
        },
        {
            source: ['fgw.sh.gov.cn/fgw_fzgh/index.html'],
            target: '/fgw/fgw_fzgh',
        },
    ],
};
