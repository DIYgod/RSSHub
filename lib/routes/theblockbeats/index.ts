import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { ofetch } from 'ofetch';
import { parseStringPromise } from 'xml2js';

export const route: Route = {
    path: '/',
    categories: ['finance'],
    example: '/theblockbeats',
    name: '律动BlockBeats',
    maintainers: ['Daring Cλlf'],
    handler,
};

const apiEndpoint = 'https://api.theblockbeats.news/v1/open-api/home-xml';

async function handler() {
    const data = await ofetch(apiEndpoint);

    const json = await parseStringPromise(data);
    const items = json.rss.channel[0].item.map((item) => ({
        title: item.title[0],
        description: item.description ? item.description[0] : '',
        author: item.author[0],
        link: item.link[0],
        pubDate: parseDate(item.pubDate[0]),
        guid: item.guid[0]._,
    }));

    return {
        title: `律动BlockBeats`,
        link: apiEndpoint,
        item: items,
    };
}
