import { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/ani/anime/:sn',
    categories: ['anime'],
    example: '/gamer/ani/anime/36868',
    parameters: { sn: '動畫 sn，在 URL 可以找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '動畫瘋 - 動畫',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const { sn } = ctx.req.param();

    const { data: response } = await got('https://api.gamer.com.tw/mobile_app/anime/v3/video.php', {
        searchParams: {
            sn,
        },
    });

    if (response.error) {
        throw new Error(response.error.message);
    }

    const anime = response.data.anime;
    const title = anime.title.replaceAll(/\[\d+?]$/g, '').trim();

    const items = anime.volumes[0]
        .map((item) => ({
            title: `${title} 第 ${item.volume} 集`,
            description: `<img src="${item.cover}">`,
            link: `https://ani.gamer.com.tw/animeVideo.php?sn=${item.video_sn}`,
        }))
        .toReversed();

    return {
        title,
        link: `https://ani.gamer.com.tw/animeRef.php?sn=${anime.anime_sn}`,
        description: anime.content?.trim(),
        item: items,
    };
}
