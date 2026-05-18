import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { defaultDomain, renderDescription } from './utils';

export const route: Route = {
    path: '/search/:keyword/:img?',
    categories: ['multimedia'],
    view: ViewType.Videos,
    example: '/pornhub/search/stepsister',
    parameters: { keyword: 'keyword', img: 'show images, set to `img=1` to enable' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: 'Keyword Search',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const { keyword, img } = ctx.req.param();
    const currentUrl = `${defaultDomain}/webmasters/search?search=${keyword}`;
    const response = await got(currentUrl);

    const showImages = img === 'img=1';

    const list = response.data.videos.map((item) => ({
        title: item.title,
        link: item.url,
        description: renderDescription({ thumbs: item.thumbs }, showImages),
        pubDate: parseDate(item.publish_date),
        category: [...new Set([...item.tags.map((t) => t.tag_name), ...item.categories.map((c) => c.category)])],
    }));

    return {
        title: `Pornhub - ${keyword}`,
        link: currentUrl,
        item: list,
    };
}
