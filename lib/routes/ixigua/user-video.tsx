import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
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
            source: ['ixigua.com/home/:uid', 'm.ixigua.com/user/:uid'],
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

    const [userInfo, videoList] = await Promise.all([
        cache.tryGet(`ixigua:user:${uid}`, async () => {
            const { data } = await ofetch('https://m.ixigua.com/video/app/user/userhome/v8/', {
                query: { to_user_id: uid },
            });
            return data.user_home_info.user_info;
        }),
        ofetch('https://m.ixigua.com/video/app/user/videolist_tab/v3/', {
            query: {
                to_user_id: uid,
                orderby: 'publishtime',
                tab: 1,
                count: 20,
            },
        }),
    ]);

    return {
        title: `${userInfo.name} 的西瓜视频`,
        link: `${host}/home/${uid}/`,
        description: userInfo.description,
        image: userInfo.large_avatar_url,
        item: videoList.data.map((i) => ({
            title: i.title,
            description: renderToString(<IxiguaVideoDescription i={i} disableEmbed={disableEmbed} />),
            link: `${host}/${i.group_id_str}`,
            pubDate: parseDate(i.publish_time, 'X'),
            author: userInfo.name,
        })),
    };
}

const IxiguaVideoDescription = ({ i, disableEmbed }: { i: any; disableEmbed?: string }) => (
    <>
        {disableEmbed ? null : (
            <>
                <iframe width="720" height="405" frameborder="0" allowfullscreen src={`${host}/iframe/${i.group_id_str}?autoplay=0`}></iframe>
                <br />
            </>
        )}
        <img src={i.large_image_list[0].url} />
        <p>{i.abstract}</p>
    </>
);
