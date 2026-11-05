import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:category?',
    categories: ['new-media'],
    example: '/focustaiwan',
    parameters: { category: '分类，见下表，默认为 news' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    name: 'Category',
    maintainers: ['nczitzk'],
    handler,
    description: `| Latest | Editor's Picks | Photos of the Day |
| ------ | -------------- | ----------------- |
| news   | editorspicks   | photos            |

| Politics | Cross-strait | Business | Society | Science & Tech | Culture | Sports |
| -------- | ------------ | -------- | ------- | -------------- | ------- | ------ |
| politics | cross-strait | business | society | sci-tech       | culture | sports |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'news';

    const rootUrl = 'https://focustaiwan.tw';
    const currentUrl = `${rootUrl}/cna2019api/cna/FTNewsList`;

    const response = await got({
        method: 'post',
        url: currentUrl,
        form: {
            action: 4,
            category,
            pageidx: 1,
            pagesize: 50,
        },
    });

    let list: DataItem[] = response.data.ResultData.Items.map((item) => {
        const pubDate = item.CreateTime ? timezone(parseDate(item.CreateTime), 8) : undefined;
        return {
            title: item.HeadLine,
            link: item.PageUrl,
            category: item.ClassName,
            pubDate: pubDate && Number.isFinite(pubDate.getTime()) ? pubDate : undefined,
        };
    });
    const limit = getRouteLimit(ctx, 50);
    const nativeOrder = ctx.req.query('sorted') === 'false';
    const allDated = list.every((item) => item.pubDate instanceof Date && Number.isFinite(item.pubDate.getTime()));
    if (!nativeOrder && allDated) {
        list = list.toSorted((a, b) => +new Date(b.pubDate!) - +new Date(a.pubDate!));
    }
    if (nativeOrder || allDated) {
        list = list.slice(0, limit);
    }

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`focustaiwan:article-body:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('img').each((_, el) => {
                    content(el).html(`<img src="${content(el).attr('data-src')}">`);
                });

                const image = content('meta[property="og:image"]').attr('content');
                const paragraph = content('.paragraph').html();
                const matches = detailResponse.data.match(/var pAudio_url = "([^" ]+\.mp3)";/);

                const description = renderToString(
                    <>
                        <img src={image} />
                        <div>{paragraph ? raw(paragraph) : null}</div>
                    </>
                );

                return {
                    description,
                    ...(matches && {
                        enclosure_url: matches[1],
                        enclosure_type: 'audio/mpeg',
                        itunes_item_image: image,
                    }),
                };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: response.data.ResultData.MetaData.Title,
        link: response.data.ResultData.MetaData.CanonicalUrl || `${rootUrl}/${category}`,
        item: items,
        language: 'en' as const,
        itunes_author: 'Focus Taiwan',
        image: 'https://imgcdn.cna.com.tw/Eng/website/img/default.png',
    };
}
