import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/nictation',
    categories: ['new-media'],
    example: '/tmtpost/word',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['www.tmtpost.com'],
    },
    name: '快报',
    maintainers: ['defp'],
    handler,
    url: 'www.tmtpost.com/nictation',
};

async function handler() {
    const currentTime = Math.floor(Date.now() / 1000);
    const oneHourAgo = currentTime - 3600;
    const url = 'https://api.tmtpost.com/v1/word/list';

    const response = await got({
        method: 'get',
        url,
        searchParams: {
            time_start: oneHourAgo,
            time_end: currentTime,
            limit: 40,
            fields: ['share_description', 'share_image', 'word_comments', 'stock_list', 'is_important', 'duration', 'word_classify', 'share_link'].join(';'),
        },
        headers: {
            'app-version': 'web1.0',
        },
    });

    const data = response.data.data;

    return {
        title: '钛媒体 - 快报',
        link: 'https://www.tmtpost.com/nictation',
        item: data.map((item) => ({
            title: item.title,
            description: item.detail,
            pubDate: parseDate(item.time_published, 'X'),
            link: item.share_link || `https://www.tmtpost.com/nictation/${item.guid}.html`,
            author: item.author_name,
        })),
    };
}
