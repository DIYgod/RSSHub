import { Route } from '@/types';
import got from '@/utils/got';
import cache from '@/utils/cache';
import { config } from '@/config';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/collection/:collectionID',
    categories: ['social-media'],
    example: '/lofter/collection/552041',
    parameters: { collectionID: 'Lofter collection ID, can be found in the share URL' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Collection',
    maintainers: ['SrakhiuMeow'],
    handler,
};

async function fetchCollection(collectionID, limit, offset = 0) {
    const response = await got({
        method: 'post',
        url: 'https://api.lofter.com/v1.1/postCollection.api?product=lofter-android-7.6.12',
        body: new URLSearchParams({
            collectionid: collectionID,
            limit: limit.toString(),
            method: 'getCollectionDetail',
            offset: offset.toString(),
            order: '0',
        }),
    });

    if (!response.data.response) {
        throw new Error('Collection Not Found');
    }

    const data = response.data.response;

    return {
        title: data.collection.name || 'Lofter Collection',
        link: data.blogInfo.homePageUrl || 'https://www.lofter.com/',
        description: data.collection.description || 'No description provided.',
        items: data.items,
    } as object;
}

async function handler(ctx) {
    const collectionID = ctx.req.param('collectionID');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : '50';

    const response = await cache.tryGet(collectionID, () => fetchCollection(collectionID, Number(limit)), config.cache.routeExpire, false);

    const { title, link, description, items } = response;

    const itemsArray = items.map((item) => ({
        title: item.post.title || item.post.noticeLinkTitle,
        link: item.post.blogPageUrl,
        description:
            JSON.parse(item.post.photoLinks || `[]`)
                .map((photo) => {
                    if (photo.raw?.match(/\/\/nos\.netease\.com\//)) {
                        photo.raw = `https://${photo.raw.match(/(imglf\d)/)[0]}.lf127.net${photo.raw.match(/\/\/nos\.netease\.com\/imglf\d(.*)/)[1]}`;
                    }
                    return `<img src='${photo.raw || photo.orign}'>`;
                })
                .join('') +
            JSON.parse(item.post.embed ? `[${item.post.embed}]` : `[]`)
                .map((video) => `<video src='${video.originUrl}' poster='${video.video_img_url}' controls='controls'></video>`)
                .join('') +
            item.post.content,
        pubDate: parseDate(item.post.publishTime),
        author: item.post.blogInfo.blogNickName,
        category: item.post.tag.split(','),
    }));

    return {
        title,
        link,
        item: itemsArray,
        description,
    };
}
