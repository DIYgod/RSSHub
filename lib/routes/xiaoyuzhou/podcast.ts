import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/podcast/:id',
    categories: ['multimedia', 'popular'],
    example: '/xiaoyuzhou/podcast/6021f949a789fca4eff4492c',
    parameters: { id: '播客id，可以在小宇宙播客的 URL 中找到' },
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
            source: ['xiaoyuzhoufm.com/podcast/:id'],
        },
    ],
    name: '播客',
    maintainers: ['hondajojo', 'jtsang4'],
    handler,
    url: 'xiaoyuzhoufm.com/',
};

async function handler(ctx) {
    const link = `https://www.xiaoyuzhoufm.com/podcast/${ctx.req.param('id')}`;
    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = load(response.data);

    const page_data = JSON.parse($('#__NEXT_DATA__')[0].children[0].data);

    const episodes = page_data.props.pageProps.podcast.episodes.map((item) => ({
        title: item.title,
        enclosure_url: item.enclosure.url,
        itunes_duration: item.duration,
        enclosure_type: 'audio/mpeg',
        link: `https://www.xiaoyuzhoufm.com/episode/${item.eid}`,
        pubDate: parseDate(item.pubDate),
        description: item.shownotes,
        itunes_item_image: (item.image || item.podcast?.image)?.smallPicUrl,
    }));

    return {
        title: page_data.props.pageProps.podcast.title,
        link: `https://www.xiaoyuzhoufm.com/podcast/${page_data.props.pageProps.podcast.pid}`,
        itunes_author: page_data.props.pageProps.podcast.author,
        itunes_category: '',
        image: page_data.props.pageProps.podcast.image.smallPicUrl,
        item: episodes,
        description: page_data.props.pageProps.podcast.description,
    };
}
