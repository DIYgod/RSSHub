import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';

import { genSize, getApiData } from './util';

export const route: Route = {
    path: '/mv/:number/:domain?',
    categories: ['multimedia'],
    example: '/bt0/mv/35575567/2',
    parameters: { number: '影视详情id, 网页路径为`/mv/{id}.html`其中的id部分, 一般为8位纯数字', domain: '数字1-9, 比如1表示请求域名为 1bt0.com, 默认为 2' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: true,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['2bt0.com/mv/'],
        },
    ],
    name: '影视资源下载列表',
    maintainers: ['miemieYaho'],
    handler,
};

async function handler(ctx) {
    const domain = ctx.req.param('domain') ?? '2';
    const number = ctx.req.param('number');
    if (!/^[1-9]$/.test(domain)) {
        throw new InvalidParameterError('Invalid domain');
    }
    const regex = /^\d{6,}$/;
    if (!regex.test(number)) {
        throw new InvalidParameterError('Invalid number');
    }

    const host = `https://www.${domain}bt0.com`;
    const data = await getApiData(host, 'getVideoDetail', { id: number });
    if (data.need_vip && Object.values<any[]>(data.ecca).every((resources) => !resources.length)) {
        throw new Error('BT0 requires a site subscription to list resources for this movie. The public latest-resources route /bt0/tlist/1 is still available.');
    }
    const items = Object.values<any[]>(data.ecca).flatMap((item) =>
        item.map((i) => ({
            title: i.zname,
            guid: `bt0:resource:${i.id}`,
            description: `文件大小：${i.zsize}`,
            link: `${host}/tr/${i.id}.html`,
            pubDate: i.ezt ? parseDate(i.ezt, 'X') : undefined,
            enclosure_type: 'application/x-bittorrent',
            enclosure_url: i.zlink,
            enclosure_length: genSize(i.zsize),
            category: strsJoin(i.zqxd, i.text_html, i.audio_html, i.new === 1 ? '新' : ''),
        }))
    );
    return {
        title: data.title,
        link: `${host}/mv/${number}.html`,
        item: items,
    };
}

function strsJoin(...strings) {
    return strings.filter((str) => str !== '').join(',');
}
