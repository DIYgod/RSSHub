import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';
import { parseDate } from '@/utils/parse-date';

const host = 'https://www.ixigua.com';

export const route: Route = {
    path: '/user/video/:uid/:disableEmbed?',
    categories: ['multimedia'],
    example: '/ixigua/user/video/4234740937',
    parameters: { uid: '用户 id, 可在用户主页中找到', disableEmbed: '默认为开启内嵌视频, 任意值为关闭' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['ixigua.com/home/:uid'],
            target: '/user/video/:uid',
        },
    ],
    name: '用户视频投稿',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const disableEmbed = ctx.req.param('disableEmbed');
    const url = `${host}/home/${uid}/?wid_try=1`;

    const response = await got(url);
    const $ = load(response.data);
    const jsData = $('#SSR_HYDRATED_DATA').html().replace('window._SSR_HYDRATED_DATA=', '').replaceAll('undefined', '""');
    const data = JSON.parse(jsData);

    const videoInfos = data.AuthorVideoList.videoList;
    const userInfo = data.AuthorDetailInfo;

    return {
        title: `${userInfo.name} 的西瓜视频`,
        link: url,
        description: userInfo.introduce,
        item: videoInfos.map((i) => ({
            title: i.title,
            description: art(path.join(__dirname, 'templates/userVideo.art'), {
                i,
                disableEmbed,
            }),
            link: `${host}/${i.groupId}`,
            pubDate: parseDate(i.publishTime * 1000),
            author: userInfo.name,
        })),
    };
}
