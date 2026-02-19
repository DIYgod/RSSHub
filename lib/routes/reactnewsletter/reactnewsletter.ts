import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const currentURL = 'https://reactnewsletter.com/issues';

export const route: Route = {
    path: '/',
    radar: [
        {
            source: ['bytes.dev/issues', 'bytes.dev/'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: ['meixger'],
    handler,
    url: 'bytes.dev/issues',
};

async function handler() {
    const resp = await got(currentURL);
    const $ = load(resp.data);
    const text = $('script#__NEXT_DATA__').text();
    const json = JSON.parse(text);

    const items = json.props.pageProps.issues.map((item) => ({
        title: item.title,
        pubDate: parseDate(item.date),
        description: item.summary,
        link: `/issues/${item.slug}`,
    }));

    return {
        title: 'reactnewsletter.dev',
        description: 'Stay up to date on the latest React news, tutorials, resources, and more. Delivered every Tuesday, for free.',
        link: currentURL,
        item: items,
    };
}
