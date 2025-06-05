import { DataItem, Route, ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/btkd',
    categories: ['multimedia'],
    view: ViewType.Audios,
    example: '/xiaoyuzhou/btkd',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: [
        {
            source: ['xiaoyuzhoufm.com/podcast/664f1ae6aa419b1eeb6056b6'],
        },
    ],
    name: '半天空档',
    maintainers: ['amlei'],
    handler,
    url: 'xiaoyuzhoufm.com/podcast/664f1ae6aa419b1eeb6056b6',
};

async function handler(ctx) {
    // 半天空档播客ID
    const id = '664f1ae6aa419b1eeb6056b6';
    const link = `https://www.xiaoyuzhoufm.com/podcast/${id}`;
    const response = await ofetch(link);

    const $ = load(response);
    const nextDataElement = $('#__NEXT_DATA__').get(0);
    const page_data = JSON.parse(nextDataElement.children[0].data);

    const podcast = page_data.props.pageProps.podcast;

    let episodes = (podcast.episodes || []).map((item) => ({
        title: item.title,
        enclosure_url: item.enclosure.url,
        itunes_duration: item.duration,
        enclosure_type: 'audio/mpeg',
        link: `https://www.xiaoyuzhoufm.com/episode/${item.eid}`,
        eid: item.eid,
        pubDate: parseDate(item.pubDate),
        itunes_item_image: (item.image || item.podcast?.image)?.smallPicUrl,
    }));

    episodes = await Promise.all(
        episodes.map((item) =>
            cache.tryGet(item.link, async () => {
                // 获取更详细的shownotes
                const episodeLink = `https://www.xiaoyuzhoufm.com/_next/data/${page_data.buildId}/episode/${item.eid}.json`;
                const response = await ofetch(episodeLink);
                const episodeItem = response.pageProps.episode;
                item.description = episodeItem.shownotes || episodeItem.description || episodeItem.title || '';
                return item as DataItem;
            })
        )
    );

    return {
        title: podcast.title,
        link: `https://www.xiaoyuzhoufm.com/podcast/${podcast.pid}`,
        itunes_author: podcast.author,
        itunes_category: '', // 可以补充分类
        image: podcast.image.smallPicUrl,
        item: episodes,
        description: podcast.description,
    };
}
