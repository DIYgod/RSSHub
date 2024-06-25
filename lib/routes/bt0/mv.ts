import { Route } from '@/types';
import { load } from 'cheerio';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import { doGot, genSize } from './util';

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
    const _link = `${host}/mv/${number}.html`;

    const $ = load(await doGot(0, host, _link));
    const name = $('span.info-title.lh32').text();
    const items = $('div.container .container .col-md-10.tex_l')
        .toArray()
        .map((item) => {
            item = $(item);
            const torrent_info = item.find('.torrent-title').first();
            const _title = torrent_info.text();
            const len = item.find('.tag-sm.tag-size.text-center').first().text();
            return {
                title: _title,
                guid: _title,
                description: `${_title}[${len}]`,
                link: host + torrent_info.attr('href'),
                pubDate: item.find('.tag-sm.tag-download.text-center').eq(1).text(),
                enclosure_type: 'application/x-bittorrent',
                enclosure_url: item.find('.col-md-3 a').first().attr('href'),
                enclosure_length: genSize(len),
            };
        });
    return {
        title: name,
        link: _link,
        item: items,
    };
}
