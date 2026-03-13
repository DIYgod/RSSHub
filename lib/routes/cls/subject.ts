import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';
import { getSearchParams, rootUrl } from './utils';

export const handler = async (ctx) => {
    const { id = '1103' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const currentUrl = new URL(`subject/${id}`, rootUrl).href;
    const apiUrl = new URL(`api/subject/${id}/article`, rootUrl).href;

    const { data: response } = await got(apiUrl, {
        searchParams: getSearchParams({
            Subject_Id: id,
        }),
    });

    let items = response.data.slice(0, limit).map((item) => {
        const title = item.article_title;
        const description = renderDescription({
            intro: item.article_brief,
        });
        const guid = `cls-${item.article_id}`;
        const image = item.article_img;

        return {
            title,
            description,
            pubDate: parseDate(item.article_time, 'X'),
            link: new URL(`detail/${item.article_id}`, rootUrl).href,
            category: item.subjects.map((s) => s.subject_name),
            author: item.article_author,
            guid,
            id: guid,
            content: {
                html: description,
                text: item.article_brief,
            },
            image,
            banner: image,
        };
    });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const data = JSON.parse($$('script#__NEXT_DATA__').text())?.props?.initialState?.detail?.articleDetail ?? undefined;

                if (!data) {
                    return item;
                }

                const title = data.title;
                const description = renderDescription({
                    images: data.images.map((i) => ({
                        src: i,
                        alt: title,
                    })),
                    intro: data.brief,
                    description: data.content,
                });
                const guid = `cls-${data.id}`;
                const image = data.images?.[0] ?? undefined;

                item.title = title;
                item.description = description;
                item.pubDate = parseDate(data.ctime, 'X');
                item.category = [...new Set(data.subject?.flatMap((s) => [s.name, ...(s.subjectCategory?.flatMap((c) => [c.columnName || [], c.name || []]) ?? [])]))].filter(Boolean);
                item.author = data.author?.name ?? item.author;
                item.guid = guid;
                item.id = guid;
                item.content = {
                    html: description,
                    text: data.content,
                };
                item.image = image;
                item.banner = image;
                item.enclosure_url = data.audioUrl;
                item.enclosure_type = item.enclosure_url ? `audio/${item.enclosure_url.split(/\./).pop()}` : undefined;
                item.enclosure_title = title;

                return item;
            })
        )
    );

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const data = JSON.parse($('script#__NEXT_DATA__').text())?.props?.initialProps?.pageProps?.subjectDetail ?? undefined;

    const author = '财联社';
    const image = data?.img ?? undefined;

    return {
        title: `${author} - ${data?.name ?? $('title').text()}`,
        description: data?.description ?? undefined,
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author,
    };
};

export const route: Route = {
    path: '/subject/:id?',
    name: '话题',
    url: 'www.cls.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/cls/subject/1103',
    parameters: { category: '分类，默认为 1103，即A股盘面直播，可在对应话题页 URL 中找到' },
    description: `::: tip
  若订阅 [有声早报](https://www.cls.cn/subject/1151)，网址为 \`https://www.cls.cn/subject/1151\`。截取 \`https://www.cls.cn/subject/\` 到末尾的部分 \`1151\` 作为参数填入，此时路由为 [\`/cls/subject/1151\`](https://rsshub.app/cls/subject/1151)。
:::
    `,
    categories: ['finance'],

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
            source: ['www.cls.cn/subject/:id'],
            target: (params) => {
                const id = params.id;

                return `/subject${id ? `/${id}` : ''}`;
            },
        },
    ],
};
