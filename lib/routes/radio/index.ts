import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export const route: Route = {
    path: '/:id',
    categories: ['picture'],
    example: '/radio/1552135',
    parameters: { id: '专辑 id，可在对应专辑页面的 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    name: '节目',
    maintainers: ['kt286', 'nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const size = ctx.req.query('limit') ?? '100';

    const rootUrl = 'https://www.radio.cn';
    const apiRootUrl = 'http://tacc.radio.cn';
    const apiUrl = `${apiRootUrl}/pcpages/odchannelpages?od_id=${id}&start=1&rows=${size}`;
    const currentUrl = `${rootUrl}/pc-portal/sanji/detail.html?columnId=${id}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    if (/^\(.*\)$/.test(response.data)) {
        response.data = JSON.parse(response.data.match(/^\((.*)\)$/)[1]);
    }

    const data = response.data.data;

    const items = data.program.map((item) => {
        const enclosure_url = item.streams[0].url;
        const enclosure_type = `audio/${enclosure_url.match(/\.(\w+)$/)[1]}`;

        return {
            guid: item.id,
            title: item.name,
            link: item.streams[0].url,
            description: art(path.join(__dirname, 'templates/description.art'), {
                description: item.description,
                enclosure_url,
                enclosure_type,
            }),
            pubDate: parseDate(item.onlinetime),
            enclosure_url,
            enclosure_type,
            itunes_duration: item.duration,
            itunes_item_image: data.odchannel.imageUrl[0].url,
        };
    });

    return {
        title: `云听 - ${data.odchannel.name}`,
        link: currentUrl,
        item: items,
        image: data.odchannel.imageUrl[0].url,
        itunes_author: data.odchannel.commissioningEditorName || data.odchannel.editorName || data.odchannel.source || 'radio.cn',
        description: data.odchannel.description || data.odchannel.sub_title || '',
    };
}
