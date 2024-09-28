import { Data, DataItem, Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import { EpisodeResult } from './types';
import utils from './utils';

export const route: Route = {
    path: '/bangumi/media/:mediaid/:embed?',
    name: '番剧',
    maintainers: ['DIYgod', 'nuomi1'],
    handler,
    example: '/bilibili/bangumi/media/9192',
    parameters: {
        mediaid: '番剧媒体 id, 番剧主页 URL 中获取',
        embed: '默认为开启内嵌视频, 任意值为关闭',
    },
    categories: ['social-media', 'popular'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportRadar: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    view: ViewType.Videos,
};

async function handler(ctx) {
    const mediaid = ctx.req.param('mediaid');
    const embed = !ctx.req.param('embed');

    const mediadata = await utils.getBangumi(mediaid, cache);
    const seasonid = String(mediadata.season_id);
    const seasondata = await utils.getBangumiItems(seasonid, cache);

    const episodes: DataItem[] = [];

    const getEpisode = (item: EpisodeResult, title: string) =>
        ({
            title,
            description: utils.renderOGVDescription(embed, item.cover, item.long_title, seasonid, String(item.id)),
            link: item.share_url,
            image: item.cover.replace('http://', 'https://'),
            language: 'zh-cn',
        }) as DataItem;

    for (const item of seasondata.main_section.episodes) {
        const episode = getEpisode(item, `第${item.title}话 ${item.long_title}`);
        episodes.push(episode);
    }

    for (const section of seasondata.section) {
        for (const item of section.episodes) {
            const episode = getEpisode(item, `${item.title} ${item.long_title}`);
            episodes.push(episode);
        }
    }

    return {
        title: mediadata.title,
        description: mediadata.evaluate,
        link: mediadata.share_url,
        item: episodes,
        image: mediadata.cover.replace('http://', 'https://'),
        language: 'zh-cn',
    } as Data;
}
