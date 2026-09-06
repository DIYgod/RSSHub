import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const currentURL = 'https://bytes.dev/archives';

export const route: Route = {
    path: '/',
    categories: ['programming'],
    example: '/bytes',
    radar: [
        {
            source: ['bytes.dev/archives', 'bytes.dev/'],
            target: '',
        },
    ],
    name: 'Your weekly dose of JS',
    maintainers: ['meixger'],
    description: 'Staying informed on the JavaScript ecosystem has never been so entertaining. Delivered every Monday and Thursday, for free.',
    handler,
    url: 'bytes.dev/archives',
};

async function handler() {
    const resp = await got(currentURL);
    const $ = load(resp.data);
    const text = $('script#__NEXT_DATA__').text();
    const json = JSON.parse(text);
    const posts = [json.props.pageProps.featuredPost, ...json.props.pageProps.posts];
    const items = posts.map((item) => ({
        title: `Issue ${item.slug}`,
        pubDate: parseDate(item.date),
        description: item.title,
        link: `/archives/${item.slug}`,
    }));

    return {
        title: 'bytes.dev',
        description: 'Your weekly dose of JS',
        link: currentURL,
        item: items,
    };
}
