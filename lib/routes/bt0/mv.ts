import { Route } from '@/types';
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
    const _link = `${host}/prod/core/system/getVideoDetail/${number}`;

    const data = (await doGot(0, host, _link)).data;
    const items = Object.keys(data.ecca).flatMap((key) =>
        data.ecca[key].map((item) => ({
            title: item.zname,
            guid: item.zname,
            description: `${item.zname}[${item.zsize}]`,
            link: `${host}/tr/${item.id}.html`,
            pubDate: item.ezt,
            enclosure_type: 'application/x-bittorrent',
            enclosure_url: item.zlink,
            enclosure_length: genSize(item.zsize),
            category: strsJoin(item.zqxd, item.text_html, item.audio_html),
        }))
    );
    return {
        title: data.title,
        link: _link,
        item: items,
    };
}

function strsJoin(...strings) {
    return strings.filter((str) => str !== '').join(',');
}
