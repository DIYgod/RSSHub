import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';

import { api, genSize, host } from './util';

export const route: Route = {
    path: '/mv/:number/:domain?',
    categories: ['multimedia'],
    example: '/bt0/mv/3158713',
    parameters: { number: '影视详情 id, 网页详情页路径为 `/mv/{id}` 中的数字部分', domain: '镜像编号, 对应域名 web{domain}.mukaku.com, 常用 2/3/5, 默认为 2' },
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
            source: ['mukaku.com/mv/:number'],
        },
    ],
    name: '影视资源下载列表',
    maintainers: ['miemieYaho', 'JaggerH'],
    handler,
};

async function handler(ctx) {
    const domain = ctx.req.param('domain') ?? '2';
    const number = ctx.req.param('number');
    if (!/^[1-9]$/.test(domain)) {
        throw new InvalidParameterError('Invalid domain');
    }
    if (!/^\d{3,}$/.test(number)) {
        throw new InvalidParameterError('Invalid number');
    }

    const data = await api(domain, 'getVideoDetail', { id: number });

    const items = (data.all_seeds ?? []).map((i) => ({
        title: i.zname,
        guid: `mukaku-seed-${i.id}`,
        description: `${i.zname}[${i.zsize}]`,
        link: `${host(domain)}/tr/${i.id}.html`,
        pubDate: parseDate(i.ezt),
        enclosure_type: 'application/x-bittorrent',
        enclosure_url: i.zlink,
        enclosure_length: genSize(i.zsize),
        category: [i.definition_group, i.zqxd, i.new === 1 ? '新' : ''].filter(Boolean),
    }));

    return {
        title: `${data.title} - 不太灵影视`,
        link: `${host(domain)}/mv/${number}`,
        item: items,
    };
}
