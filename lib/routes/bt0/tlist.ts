import { Route } from '@/types';
import { load } from 'cheerio';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import { doGot, genSize } from './util';

const categoryDict = {
    1: '电影',
    2: '电视剧',
    3: '周热门',
    4: '月热门',
    5: '年度热门',
};

export const route: Route = {
    path: '/tlist/:sc/:domain?',
    categories: ['multimedia'],
    example: '/bt0/tlist/1',
    parameters: { sc: '分类(1-5), 1:电影, 2:电视剧, 3:周热门, 4:月热门, 5:年度热门', domain: '数字1-9, 比如1表示请求域名为 1bt0.com, 默认为 2' },
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
    const _link = `${host}/tlist.php?sc=${sc}`;

    const $ = load(await doGot(0, host, _link));
    const items = $('div.left.bf100.hig90.ov_hid.po_rel.trall3.dou3')
        .toArray()
        .map((item) => {
            item = $(item);
            const ah = item.find('a');
            const _title = ah.eq(1).text();
            const ds = item.find('.huise2.fs12 .left');
            return {
                title: _title,
                guid: _title,
                description: `${ds.eq(0).text()}  ${ds.eq(1).text()}<br>${ds.eq(2).text()}<br>${ds.eq(3).text()}<br>${ds.eq(4).text()}`,
                link: host + ah.eq(1).attr('href'),
                pubDate: item.find('.bghuise9').first().text(),
                enclosure_type: 'application/x-bittorrent',
                enclosure_url: ah.eq(2).attr('href'),
                enclosure_length: genSize(item.find('.marl10.bgzise').first().text()),
            };
        });
    return {
        title: `不太灵-最新资源列表-${categoryDict[sc]}`,
        link: _link,
        item: items,
    };
}
