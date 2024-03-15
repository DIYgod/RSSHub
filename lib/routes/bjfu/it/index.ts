import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import util from './utils';
import iconv from 'iconv-lite';

export const route: Route = {
    path: '/it/:type',
    categories: ['university'],
    example: '/bjfu/it/xyxw',
    parameters: { type: '通知类别' },
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
            source: ['it.bjfu.edu.cn/:type/index.html'],
        },
    ],
    name: '信息学院通知',
    maintainers: ['wzc-blog'],
    handler,
    description: `| 学院新闻 | 科研动态 | 本科生培养 | 研究生培养 |
  | -------- | -------- | ---------- | ---------- |
  | xyxw     | kydt     | pydt       | pydt2      |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    let title, path;
    switch (type) {
        case 'kydt':
            title = '科研动态';
            path = 'kyxz/kydt/';
            break;
        case 'pydt':
            title = '本科生培养';
            path = 'bkspy/pydt/';
            break;
        case 'pydt2':
            title = '研究生培养';
            path = 'yjspy/pydt2/';
            break;
        default:
            title = '学院新闻';
            path = 'xyxw/';
    }
    const base = 'http://it.bjfu.edu.cn/' + path;

    const response = await got({
        method: 'get',
        responseType: 'buffer',
        url: base,
    });

    const data = response.data;
    let $ = load(iconv.decode(data, 'utf-8'));
    const charset = $('meta[charset]').attr('charset');
    if (charset?.toLowerCase() !== 'utf-8') {
        $ = load(iconv.decode(data, charset ?? 'utf-8'));
    }

    const list = $('.item-content').toArray();

    const result = await util.ProcessFeed(base, list, cache); // 感谢@hoilc指导

    return {
        title: '北林信息 - ' + title,
        link: 'http://it.bjfu.edu.cn/' + path,
        description: '北京林业大学信息学院 - ' + title,
        item: result,
    };
}
