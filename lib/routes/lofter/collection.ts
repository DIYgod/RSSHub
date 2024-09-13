import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';


export const route: Route = {
    path: '/collection/:collectionID',
    categories: ['social-media'],
    example: '/lofter/collection/collectionID',
    parameters: { collectionID: 'Lofter collection ID, can be found in the share URL'},
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
    description: ``,
};

async function handler(ctx) {
    const collectionID = ctx.req.param('collectionID');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : '50';


    const response = await got({
        method: 'post',
        url: `https://api.lofter.com/v1.1/postCollection.api?product=lofter-android-7.6.12`,
        body: new URLSearchParams({
            collectionid: collectionID,
            limit: limit.toString(),
            method: 'getCollectionDetail',
            offset: '0',
        }),
    });

    if (!response.data.response || response.data.response.items.length === 0) {
        throw new Error('Collection Not Found');
    }

    const items = response.data.response.items.map((item) => ({
        title: item.post.title,
        link: item.post.blogPageUr,
        description:
            JSON.parse(item.post.photoLinks || `[]`)
                .map((photo) => {
                    if (photo.raw?.match(/\/\/nos\.netease\.com\//)) {
                        photo.raw = `https://${photo.raw.match(/(imglf\d)/)[0]}.lf127.net${photo.raw.match(/\/\/nos\.netease\.com\/imglf\d(.*)/)[1]}`;
                    }
                    return `<img src="${photo.raw || photo.orign}">`;
                })
                .join('') +
            JSON.parse(item.post.embed ? `[${item.post.embed}]` : `[]`)
                .map((video) => `<video src="${video.originUrl}" poster="${video.video_img_url}" controls="controls"></video>`)
                .join('') +
            item.post.content,
        pubDate: parseDate(item.post.publishTime),
        author: item.post.blogInfo.blogNickName,
        category: item.post.tag.split(','),
    }));

    return {
        title: `${response.data.response.collection.name} | LOFTER`,
        link: `${items[0].link}`,
        item: items,
        description:  `${response.data.response.collection.description}`,
    };
}
