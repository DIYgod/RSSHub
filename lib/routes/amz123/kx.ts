import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/kx',
    categories: ['new-media'],
    example: '/amz123/kx',
    parameters: {},
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
            source: ['amz123.com/kx'],
            target: '/kx',
        },
    ],
    name: 'AMZ123 快讯',
    maintainers: ['defp'],
    handler,
    url: 'amz123.com/kx',
    view: ViewType.Articles,
};

async function handler() {
    const limit = 12;
    const apiRootUrl = 'https://api.amz123.com';
    const rootUrl = 'https://www.amz123.com';

    const { data: response } = await got.post(`${apiRootUrl}/ugc/v1/user_content/forum_list`, {
        json: {
            page: 1,
            page_size: limit,
            tag_id: 0,
            fid: 4,
            ban: 0,
            is_new: 1,
        },
        headers: {
            'content-type': 'application/json',
        },
    });

    const items = response.data.rows.map((item) => ({
        title: item.title,
        description: item.description,
        pubDate: parseDate(item.published_at * 1000),
        link: `${rootUrl}/kx/${item.id}`,
        author: item.author?.username,
        category: item.tags.map((tag) => tag.name),
        guid: item.resource_id,
    }));

    return {
        title: 'AMZ123 快讯',
        link: `${rootUrl}/kx`,
        item: items,
    };
}
