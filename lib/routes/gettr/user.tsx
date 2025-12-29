import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const actionMap = {
    pub_pst: 'Published a post: ',
    shares_cm: 'Shared a comment: ',
    shares_pst: 'Shared a post: ',
};

export const route: Route = {
    path: '/user/:id',
    categories: ['social-media'],
    view: ViewType.SocialMedia,
    example: '/gettr/user/jasonmillerindc',
    parameters: { id: 'User id' },
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
            source: ['gettr.com/user/:id'],
        },
    ],
    name: 'User timeline',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const baseUrl = 'https://gettr.com';
    const apiHost = 'https://api.gettr.com';
    const mediaHost = 'https://media.gettr.com';
    const id = ctx.req.param('id');

    const { data: posts } = await got(`${apiHost}/u/user/${id}/posts`, {
        // headers: {
        //     version: '2.7.0',
        //     'x-app-auth': '{"user": null, "token": null}',
        // },
        searchParams: {
            offset: 0,
            max: 20,
            dir: 'fwd',
            incl: 'posts|stats|userinfo|shared|liked|pvotes',
            fp: 'f_uo',
        },
    });
    const userInfo = posts.result.aux.uinf[id];

    const items = posts.result.data.list.map((post) => {
        const title = posts.result.aux.post[post.activity.pstid].txt;
        const description = renderToString(<GettrPostDescription post={posts.result.aux.post[post.activity.pstid]} mediaHost={mediaHost} />);
        return {
            title: `${actionMap[post.action]} ${title}`,
            description,
            pubDate: parseDate(post.cdate),
            updated: parseDate(post.udate),
            link: `${baseUrl}/post/${post.activity.pstid}`,
        };
    });

    return {
        title: `${userInfo.nickname} on Gettr`,
        description: userInfo.dsc,
        link: `${baseUrl}/user/${id}`,
        image: `${mediaHost}/${userInfo.ico}`,
        language: 'en',
        item: items,
    };
}

const GettrPostDescription = ({ post, mediaHost }: { post: any; mediaHost: string }) => (
    <>
        {post.txt ? (
            <>
                {raw(post.txt.replaceAll('\n', '<br>'))}
                <br />
            </>
        ) : null}
        {post.previmg ? (
            <>
                <img src={post.previmg} />
                <br />
            </>
        ) : null}
        {post.ttl && post.prevsrc ? (
            <>
                <b>
                    <a href={post.prevsrc}>{post.ttl}</a>
                </b>
                <br />
            </>
        ) : null}
        {post.dsc && post.prevsrc ? (
            <>
                <a href={post.prevsrc}>{post.dsc}</a>
                <br />
            </>
        ) : null}
        {post.imgs ? (
            <>
                {post.imgs.map((img) => (
                    <img src={`${mediaHost}/${img}`} />
                ))}
            </>
        ) : null}
    </>
);
