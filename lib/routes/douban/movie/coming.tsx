import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/movie/coming',
    categories: ['social-media'],
    example: '/douban/movie/coming',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '电影即将上映',
    maintainers: ['reonokiy'],
    radar: [
        {
            title: '豆瓣电影-即将上映',
            source: ['movie.douban.com/coming'],
            target: '/movie/coming',
        },
    ],
    handler,
};
const renderDescription = (info: { title?: string; cover_url?: string; pubdate?: string[]; intro?: string; directors?: string[]; actors?: string[]; genres: string[]; wish_count?: number | string }): string =>
    renderToString(
        <>
            {info.cover_url && info.title ? <img src={info.cover_url} alt={info.title} referrerpolicy="no-referrer" /> : null}
            <h2>电影信息</h2>
            <ul>
                {info.directors?.length ? <li>导演：{info.directors.join(', ')}</li> : null}
                {info.actors?.length ? <li>演员：{info.actors.join(', ')}</li> : null}
                {info.genres?.length ? <li>类型：{info.genres.join(' / ')}</li> : null}
                {info.pubdate?.length ? <li>上映日期：{info.pubdate.join(' / ')}</li> : null}
                {info.wish_count ? <li>想看：{info.wish_count}</li> : null}
            </ul>
            {info.intro ? (
                <>
                    <h2>剧情简介</h2>
                    <p>{info.intro}</p>
                </>
            ) : null}
        </>
    );

async function handler(ctx) {
    const response = await got({
        method: 'get',
        url: 'https://m.douban.com/rexxar/api/v2/movie/coming_soon',
        headers: {
            Referer: 'https://m.douban.com/movie/',
        },
    });

    ctx.set('json', { response });

    return {
        title: '豆瓣电影-即将上映',
        link: 'https://movie.douban.com/coming',
        item: response.data?.subjects?.map((item) => ({
            title: item?.title,
            link: item?.url,
            guid: item?.url,
            description: renderDescription({
                title: item?.title,
                intro: item?.intro,
                pubdate: item?.pubdate,
                cover_url: item?.cover_url,
                directors: item?.directors?.map((d) => d?.name),
                actors: item?.actors?.map((a) => a?.name),
                genres: item?.genres,
                wish_count: item?.wish_count,
            }),
            category: item?.genres,
            itunes_item_image: item?.cover_url,
            upvotes: item?.wish_count,
        })),
    };
}
