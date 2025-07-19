import { Route } from '@/types';
import { defaultDomain, getApiUrl, getRootUrl, processApiItems } from './utils';
import { art } from '@/utils/render';
import path from 'node:path';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/album/:id',
    categories: ['anime'],
    example: '/18comic/album/292282',
    parameters: { id: '专辑 id，可在专辑页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['jmcomic.group/'],
        },
    ],
    name: '专辑',
    maintainers: ['nczitzk'],
    handler,
    url: 'jmcomic.group/',
    description: `::: tip
  专辑 id 不包括 URL 中标题的部分。
:::`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const { domain = defaultDomain } = ctx.req.query();
    const rootUrl = getRootUrl(domain);
    const currentUrl = `${rootUrl}/album/${id}`;

    const apiUrl = `${getApiUrl()}/album?id=${id}`;

    const apiResult = await processApiItems(apiUrl);

    const category = apiResult.tags;
    const author = apiResult.author.join(', ');
    const description = apiResult.description;
    const addTime = apiResult.addtime;
    let results: any[] = [];
    if (apiResult.series.length === 0) {
        results.push({
            title: apiResult.name,
            link: `${rootUrl}/photo/${id}`,
            guid: `${rootUrl}/photo/${id}`,
            updated: new Date(addTime * 1000),
            pubDate: new Date(addTime * 1000),
            category,
            author,
            description: art(path.join(__dirname, 'templates/description.art'), {
                introduction: description,
                // 不取图片，因为专辑的图片会被分割排序，所以只取封面图
                images: [`https://cdn-msp3.${domain}/media/albums/${id}_3x4.jpg`],
                cover: `https://cdn-msp3.${domain}/media/albums/${id}_3x4.jpg`,
                category,
            }),
        });
    } else {
        results = await Promise.all(
            apiResult.series.map((item, index) =>
                cache.tryGet(`18comic:album:${item.id}`, async () => {
                    const chapterApiUrl = `${getApiUrl()}/chapter?id=${item.id}`;
                    const chapterResult = await processApiItems(chapterApiUrl);
                    const result = {};
                    const chapterNum = index + 1;
                    result.title = `第${String(chapterNum)}話 ${item.name === '' ? `${String(chapterNum)}` : item.name}`;
                    result.link = `${rootUrl}/photo/${item.id}`;
                    result.guid = `${rootUrl}/photo/${item.id}`;
                    result.updated = new Date(chapterResult.addtime * 1000);
                    result.pubDate = addTime;
                    result.category = category;
                    result.author = author;
                    result.description = art(path.join(__dirname, 'templates/description.art'), {
                        introduction: description,
                        // 不取图片，因为专辑的图片会被分割排序，所以只取封面图
                        images: [`https://cdn-msp3.${domain}/media/albums/${item.id}_3x4.jpg`],
                        cover: `https://cdn-msp3.${domain}/media/albums/${item.id}_3x4.jpg`,
                        category,
                    });
                    return result;
                })
            )
        );
        results = results.reverse();
    }

    return {
        title: `${apiResult.name} - 禁漫天堂`,
        link: currentUrl.replace(/\?$/, ''),
        item: results,
        allowEmpty: true,
        description,
    };
}
