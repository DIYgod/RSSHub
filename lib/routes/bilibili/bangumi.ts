import { Data, DataItem, Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import { EpisodeResult } from './types';
import utils from './utils';

export const route: Route = {
    path: '/bangumi/media/:mediaid/:embed?',
    name: '番剧',
    parameters: {
        mediaid: '番剧媒体 id, 番剧主页 URL 中获取',
        embed: '默认为开启内嵌视频, 任意值为关闭',
    },
    example: '/bilibili/bangumi/media/9192',
    categories: ['social-media', 'popular'],
    view: ViewType.Videos,
    maintainers: ['DIYgod', 'nuomi1'],
    handler,
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportRadar: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
};

async function handler(ctx) {
    const mediaId = ctx.req.param('mediaid');
    const embed = !ctx.req.param('embed');

    const mediaData = await utils.getBangumi(mediaId, cache);
    const seasonId = String(mediaData.season_id);
    const seasonData = await utils.getBangumiItems(seasonId, cache);

    const episodes: DataItem[] = [];

    const getEpisode = (item: EpisodeResult, title: string) =>
        ({
            title,
            description: utils.renderOGVDescription(embed, item.cover, item.long_title, seasonId, String(item.id)),
            link: item.share_url,
            image: item.cover.replace('http://', 'https://'),
            language: 'zh-cn',
        }) as DataItem;

    for (const item of seasonData.main_section.episodes) {
        const episode = getEpisode(item, `第${item.title}话 ${item.long_title}`);
        episodes.push(episode);
    }

    for (const section of seasonData.section) {
        for (const item of section.episodes) {
            const episode = getEpisode(item, `${item.title} ${item.long_title}`);
            episodes.push(episode);
        }
    }

    return {
        title: mediaData.title,
        description: mediaData.evaluate,
        link: mediaData.share_url,
        item: episodes,
        image: mediaData.cover.replace('http://', 'https://'),
        language: 'zh-cn',
    } as Data;
}
