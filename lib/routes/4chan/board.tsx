import type { Context } from 'hono';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/board/:board/:routeParams?',
    categories: ['social-media'],
    example: '/4chan/board/lgbt',
    parameters: { board: '4chan board' },
    // features: {
    //     requireConfig: [
    //     ],
    //     requirePuppeteer: false,
    //     antiCrawler: false,
    //     supportBT: false,
    //     supportPodcast: false,
    //     supportScihub: false,
    // },
    name: 'Latest posts from 4chan board',
    maintainers: ['heisenshark'],
    handler,
    radar: [
        {
            source: ['4chan.org/home'],
            target: '/:board',
        },
    ],
};

async function handler(ctx: Context) {
    const { board } = ctx.req.param();

    const { data: rqdata }: { data: Array<{ page: number; threads: ChanPost[] }> } = await got(`https://a.4cdn.org/${board}/catalog.json`);

    const data = (rqdata as Array<{ threads: ChanPost[] }>).flatMap((page: { threads: ChanPost[] }) => page.threads) as ChanPost[];

    const items = data.map((thread) => ({ author: thread.name, category: undefined, description: renderPost(thread, board), link: `/${board}/thread/${thread.no}`, pubDate: new Date(thread.time * 1000), title: thread.sub ?? '' }));

    await new Promise((resolve) => setTimeout(resolve, 1));
    return {
        title: `4chan's /${board}/`,
        link: `https://boards.4chan.org/`,
        item: items,
    };
}

function renderPost(post: ChanPost, board: string) {
    let media = <></>;
    switch (post.ext) {
        case '.jpg':
        case '.png':
        case '.gif':
            media = <img width={post.w} height={post.h} style="" src={`https://i.4cdn.org/${board}/${post.tim}${post.ext}`} referrerpolicy="no-referrer" />;
            break;
        case '.pdf':
            media = <embed src={`https://i.4cdn.org/${board}/${post.tim}${post.ext}`} width="100%" height="500px"></embed>;
            break;
        case '.swf':
        case '.webm':
            // media = (<video controls width={post.w}>
            //     <source src={`https://i.4cdn.org/${board}/${post.tim}${post.ext}`} type="video/webm" />
            // </video>);
            media = (
                <>
                    <br />
                    <video src={`https://i.4cdn.org/${board}/${post.tim}${post.ext}`} loop="" class="full-image" controls=""></video>
                </>
            );
            break;
        default:
            break;
    }
    const description = post.com + renderToString(media);
    return description;
}

interface ChanPost {
    no: number; // positive
    resto: number; // 0 | positive
    sticky?: number; // 1 | undefined
    closed?: number; // 1 | undefined
    now: string; // date
    time: number; // unix time
    name: string;
    trip?: string;
    id?: string;
    capcode?: string;
    country?: string;
    country_name?: string;
    sub?: string;
    com?: string;
    tim?: number; // unix time + microtime, always with image
    filename: string;
    ext: '.jpg' | '.png' | '.gif' | '.pdf' | '.swf' | '.webm';
    fsize: number;
    md5: string;
    w?: number;
    h?: number;
    tn_w?: number;
    tn_h?: number;
    filedeleted?: 1;
    spoiler?: 1;
    custom_spoiler?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
    omitted_posts?: number;
    omitted_images?: number;
    replies?: number;
    images?: number;
    bumplimit?: 1;
    imagelimit?: 1;
    last_modified?: number;
    tag?: string;
    semantic_url?: string;
    since4pass?: number;
    unique_ips?: number;
    m_img?: 1;
    last_replies?: ChanPost[];
}
