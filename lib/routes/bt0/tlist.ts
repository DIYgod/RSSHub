import { Route } from '@/types';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import { doGot, genSize } from './util';
import { parseRelativeDate } from '@/utils/parse-date';

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
    parameters: { sc: '分类(1-5), 1:电影, 2:电视剧, 3:近日热门, 4:本周热门, 5:本月热门', domain: '数字1-9, 比如1表示请求域名为 1bt0.com, 默认为 2' },
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
            source: ['2bt0.com/tlist/'],
        },
    ],
    name: '最新资源列表',
    maintainers: ['miemieYaho'],
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

    const host = `https://www.${domain}bt0.com`;
    const _link = `${host}/prod/core/system/getTList?sc=${sc}`;

    const data = await doGot(0, host, _link);
    const items = data.data.list.map((item) => ({
        title: item.zname,
        guid: item.zname,
        description: `《${item.title}》  导演: ${item.daoyan}<br>编剧: ${item.bianji}<br>演员: ${item.yanyuan}<br>简介: ${item.conta.trim()}`,
        link: host + item.aurl,
        pubDate: item.eztime.endsWith('前') ? parseRelativeDate(item.eztime) : item.eztime,
        enclosure_type: 'application/x-bittorrent',
        enclosure_url: item.zlink,
        enclosure_length: genSize(item.zsize),
        itunes_item_image: item.epic,
    }));
    return {
        title: `不太灵-最新资源列表-${categoryDict[sc]}`,
        link: `${host}/tlist/${sc}_1.html`,
        item: items,
    };
}
