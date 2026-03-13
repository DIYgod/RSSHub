import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
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
    maintainers: ['FlashWingShadow', 'Fatpandac', 'pseudoyu'],
    handler,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const disableEmbed = ctx.req.param('disableEmbed');
    const url = `${host}/home/${uid}/?wid_try=1`;

    const { data } = await got(url);
    const $ = load(data);
    const jsData = $('#SSR_HYDRATED_DATA').html();

    if (!jsData) {
        throw new Error('Failed to find SSR_HYDRATED_DATA');
    }

    const jsonData = JSON.parse(jsData.match(/var\s+data\s*=\s*({.*?});/s)?.[1].replaceAll('undefined', 'null') || '{}');

    const {
        AuthorVideoList: { videoList: videoInfos },
        AuthorDetailInfo: userInfo,
    } = jsonData;

    if (!videoInfos || !userInfo) {
        throw new Error('Failed to extract required data from JSON');
    }

    return {
        title: `${userInfo.name} 的西瓜视频`,
        link: url,
        description: userInfo.introduce,
        item: videoInfos.map((i) => ({
            title: i.title,
            description: renderToString(<IxiguaVideoDescription i={i} disableEmbed={disableEmbed} />),
            link: `${host}/${i.groupId}`,
            pubDate: parseDate(i.publishTime * 1000),
            author: userInfo.name,
        })),
    };
}

const IxiguaVideoDescription = ({ i, disableEmbed }: { i: any; disableEmbed?: string }) => (
    <>
        {disableEmbed ? null : (
            <>
                <iframe width="720" height="405" frameborder="0" allowfullscreen src={`https://www.ixigua.com/iframe/${i.groupId}?autoplay=0`} referrerpolicy="unsafe-url" allowfullscreen></iframe>
                <br />
            </>
        )}
        <img src={i.coverUrl} />
        <p>{i.abstract}</p>
    </>
);
