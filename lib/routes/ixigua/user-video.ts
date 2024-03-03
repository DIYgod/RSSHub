// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import * as path from 'node:path';
import { parseDate } from '@/utils/parse-date';

const host = 'https://www.ixigua.com';

export default async (ctx) => {
    const uid = ctx.req.param('uid');
    const disableEmbed = ctx.req.param('disableEmbed');
    const url = `${host}/home/${uid}/?wid_try=1`;

    const response = await got(url);
    const $ = load(response.data);
    const jsData = $('#SSR_HYDRATED_DATA').html().replace('window._SSR_HYDRATED_DATA=', '').replaceAll('undefined', '""');
    const data = JSON.parse(jsData);

    const videoInfos = data.AuthorVideoList.videoList;
    const userInfo = data.AuthorDetailInfo;

    ctx.set('data', {
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
    });
};
