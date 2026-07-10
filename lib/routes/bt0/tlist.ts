import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';

import { api, genSize, host } from './util';

const categoryDict = {
    1: '电影',
    2: '电视剧',
    3: '近日热门',
    4: '本周热门',
    5: '本月热门',
};

export const route: Route = {
    path: '/tlist/:sc/:domain?',
    categories: ['multimedia'],
    example: '/bt0/tlist/1',
    parameters: { sc: '分类(1-5), 1:电影, 2:电视剧, 3:近日热门, 4:本周热门, 5:本月热门', domain: '镜像编号, 对应域名 web{domain}.mukaku.com, 常用 2/3/5, 默认为 2' },
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
            source: ['mukaku.com/tlist/'],
        },
    ],
    name: '最新资源列表',
    maintainers: ['miemieYaho', 'JaggerH'],
    handler,
};

async function handler(ctx) {
    const domain = ctx.req.param('domain') ?? '2';
    const sc = ctx.req.param('sc');
    if (!/^[1-9]$/.test(domain)) {
        throw new InvalidParameterError('Invalid domain');
    }
    if (!/^[1-5]$/.test(sc)) {
        throw new InvalidParameterError('Invalid sc');
    }

    const data = await api(domain, 'getTList', { sc, page: 1 });
    const items = data.list.map((item) => ({
        title: item.zname,
        guid: item.zname,
        description: `《${item.title}》  导演: ${item.daoyan}<br>编剧: ${item.bianji}<br>演员: ${item.yanyuan}<br>简介: ${item.conta.trim()}`,
        link: host(domain) + item.aurl,
        pubDate: item.eztime.endsWith('前') ? parseRelativeDate(item.eztime) : parseDate(item.eztime),
        enclosure_type: 'application/x-bittorrent',
        enclosure_url: item.zlink,
        enclosure_length: genSize(item.zsize),
        itunes_item_image: item.epic,
    }));
    return {
        title: `不太灵-最新资源列表-${categoryDict[sc]}`,
        link: `${host(domain)}/tlist`,
        item: items,
    };
}
