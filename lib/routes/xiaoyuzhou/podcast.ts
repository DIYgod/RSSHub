import { Route, ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/podcast/:id',
    categories: ['multimedia', 'popular'],
    view: ViewType.Audios,
    example: '/xiaoyuzhou/podcast/6021f949a789fca4eff4492c',
    parameters: { id: '播客 id 或单集 id，可以在小宇宙播客的 URL 中找到' },
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
            source: ['xiaoyuzhoufm.com/podcast/:id', 'xiaoyuzhoufm.com/episode/:id'],
        },
    ],
    name: '播客',
    maintainers: ['hondajojo', 'jtsang4', 'pseudoyu'],
    handler,
    url: 'xiaoyuzhoufm.com/',
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    let link;
    let response;
    let $;
    let page_data;

    // First try podcast URL, if that fails try episode URL
    try {
        link = `https://www.xiaoyuzhoufm.com/podcast/${id}`;
        response = await ofetch(link);

        $ = load(response);
        const nextDataElement = $('#__NEXT_DATA__').get(0);
        page_data = JSON.parse(nextDataElement.children[0].data);

        // If no episodes found, we should try episode URL
        if (!page_data.props.pageProps.podcast?.episodes) {
            throw new Error('No episodes found in podcast data');
        }
    } catch {
        // Try as episode instead
        link = `https://www.xiaoyuzhoufm.com/episode/${id}`;
        response = await ofetch(link);

        $ = load(response);
        const podcastLink = $('a[href^="/podcast/"].name').attr('href');

        if (podcastLink) {
            const podcastId = podcastLink.split('/').pop();
            link = `https://www.xiaoyuzhoufm.com/podcast/${podcastId}`;
            response = await ofetch(link);

            $ = load(response);
            const nextDataElement = $('#__NEXT_DATA__').get(0);
            page_data = JSON.parse(nextDataElement.children[0].data);
        }
    }

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
