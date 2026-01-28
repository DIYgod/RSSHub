import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/weekly',
    categories: ['multimedia'],
    example: '/bandcamp/weekly',
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
            source: ['bandcamp.com/'],
        },
    ],
    name: 'Weekly',
    maintainers: ['nczitzk'],
    handler,
    url: 'bandcamp.com/',
};

async function handler() {
    const rootUrl = 'https://bandcamp.com';
    const apiUrl = `${rootUrl}/api/bcweekly/3/list`;
    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.results.slice(0, 50).map((item) => ({
        title: item.title,
        link: `${rootUrl}/?show=${item.id}`,
        pubDate: parseDate(item.published_date),
        description: renderToString(<BandcampWeekly v2ImageId={item.v2_image_id} desc={item.desc} />),
    }));

    return {
        title: 'Bandcamp Weekly',
        link: rootUrl,
        item: items,
    };
}

const BandcampWeekly = ({ v2ImageId, desc }: { v2ImageId: string; desc: string }) => (
    <>
        <img src={`https://f4.bcbits.com/img/00${v2ImageId}_0`} />
        <p>{desc}</p>
    </>
);
