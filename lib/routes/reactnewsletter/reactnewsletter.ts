import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const currentURL = 'https://reactnewsletter.com/issues';

export const route: Route = {
    path: '/',
    categories: ['programming'],
    example: '/reactnewsletter',
    radar: [
        {
            source: ['reactnewsletter.com/issues', 'reactnewsletter.com/'],
            target: '',
        },
    ],
    name: 'Archives',
    description: 'Archive summaries of React news, tutorials, and resources.',
    maintainers: ['meixger'],
    handler,
    url: 'reactnewsletter.com/issues',
};

async function handler() {
    const resp = await got(currentURL);
    const $ = load(resp.data);
    const text = $('script#__NEXT_DATA__').text();
    const json = JSON.parse(text);

    const items = json.props.pageProps.issues.map((item) => ({
        title: item.title,
        pubDate: item.date ? parseDate(`${item.date} +0000`, 'YYYY-MM-DD ZZ') : undefined,
        description: item.summary,
        link: `/issues/${item.slug}`,
    }));

    return {
        title: $('title').text(),
        description: 'Archive summaries of React news, tutorials, and resources.',
        link: currentURL,
        item: items,
    };
}
