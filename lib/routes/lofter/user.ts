import InvalidParameterError from '@/errors/types/invalid-parameter';
import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { isValidHost } from '@/utils/valid-host';

export const route: Route = {
    path: '/user/:name?',
    categories: ['social-media', 'popular'],
    example: '/lofter/user/i',
    view: ViewType.Articles,
    parameters: { name: 'Lofter user name, can be found in the URL' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'User',
    maintainers: ['hondajojo', 'nczitzk', 'LucunJi'],
    handler,
};

async function handler(ctx) {
    const name = ctx.req.param('name') ?? 'i';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : '50';
    if (!isValidHost(name)) {
        throw new InvalidParameterError('Invalid name');
    }

    const rootUrl = `${name}.lofter.com`;

    const response = await got({
        method: 'post',
        url: `http://api.lofter.com/v2.0/blogHomePage.api?product=lofter-iphone-10.0.0`,
        body: new URLSearchParams({
            blogdomain: rootUrl,
            checkpwd: '1',
            following: '0',
            limit,
            method: 'getPostLists',
            needgetpoststat: '1',
            offset: '0',
            postdigestnew: '1',
            supportposttypes: '1,2,3,4,5,6',
        }),
    });

    if (!response.data.response || response.data.response.posts.length === 0) {
        throw new Error('Blog Not Found');
    }

    const items = response.data.response.posts.map((item) => ({
        title: item.post.title || item.post.noticeLinkTitle,
        link: item.post.blogPageUrl,
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
        title: `${items[0].author} | LOFTER`,
        link: `https://${rootUrl}`,
        item: items,
        description: response.data.response.posts[0].post.blogInfo.selfIntro,
    };
}
