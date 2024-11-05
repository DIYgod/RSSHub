import { Route, ViewType } from '@/types';
import got from '@/utils/got';
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
    let link = `https://www.xiaoyuzhoufm.com/podcast/${id}`;
    let response = await got({
        method: 'get',
        url: link,
    });

    let $ = load(response.data);
    let page_data = JSON.parse($('#__NEXT_DATA__')[0].children[0].data);

    if (!page_data.props.pageProps.podcast?.episodes) {
        // If episodes are not found, it might be an episode page
        // Try to get the podcast id from the episode page
        link = `https://www.xiaoyuzhoufm.com/episode/${id}`;
        response = await got({
            method: 'get',
            url: link,
        });

        $ = load(response.data);
        const podcastLink = $('.jsx-605929003.podcast-title .jsx-605929003.name').attr('href');
        if (podcastLink) {
            const podcastId = podcastLink.split('/').pop();
            link = `https://www.xiaoyuzhoufm.com/podcast/${podcastId}`;
            response = await got({
                method: 'get',
                url: link,
            });

            $ = load(response.data);
            page_data = JSON.parse($('#__NEXT_DATA__')[0].children[0].data);
        }
    }

    if (!page_data.props.pageProps.podcast?.episodes) {
        throw new Error('Failed to fetch podcast episodes');
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
