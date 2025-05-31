import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { defaultDomain, renderDescription } from './utils';

export const route: Route = {
    path: '/search/:keyword',
    categories: ['multimedia'],
    view: ViewType.Videos,
    example: '/pornhub/search/stepsister',
    parameters: { keyword: 'keyword' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Keyword Search',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const keyword = ctx.req.param('keyword');
    const currentUrl = `${defaultDomain}/webmasters/search?search=${keyword}`;
    const response = await got(currentUrl);

    const list = response.data.videos.map((item) => ({
        title: item.title,
        link: item.url,
        description: renderDescription({ thumbs: item.thumbs }),
        pubDate: parseDate(item.publish_date),
        category: [...new Set([...item.tags.map((t) => t.tag_name), ...item.categories.map((c) => c.category)])],
    }));

    return {
        title: `Pornhub - ${keyword}`,
        link: currentUrl,
        item: list,
    };
}
