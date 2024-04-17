import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/podcast/:id',
    categories: ['multimedia'],
    example: '/apple/podcast/id1559695855',
    parameters: { id: '播客id，可以在 Apple 播客app 内分享的播客的 URL 中找到' },
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
            source: ['podcasts.apple.com/cn/podcast/:id'],
        },
    ],
    name: '播客',
    maintainers: ['Acring'],
    handler,
    url: 'https://www.apple.com.cn/apple-podcasts/',
};

async function handler(ctx) {
    const link = `https://podcasts.apple.com/cn/podcast/${ctx.req.param('id')}`;
    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = load(response.data);

    const page_data = JSON.parse($('#shoebox-media-api-cache-amp-podcasts').text());

    const data = JSON.parse(page_data[Object.keys(page_data)[0]]).d[0];
    const attributes = data.attributes;

    const episodes = data.relationships.episodes.data.map((item) => {
        const attr = item.attributes;
        return {
            title: attr.name,
            enclosure_url: attr.assetUrl,
            itunes_duration: attr.durationInMilliseconds / 1000,
            enclosure_type: 'audio/mp4',
            link: attr.url,
            pubDate: parseDate(attr.releaseDateTime),
            description: attr.description.standard.replaceAll('\n', '<br>'),
        };
    });

    return {
        title: attributes.name,
        link: attributes.url,
        itunes_author: attributes.artistName,
        item: episodes,
        description: attributes.description.standard,
    };
}
