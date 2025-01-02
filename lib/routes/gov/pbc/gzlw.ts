import { Route } from '@/types';
import { processItems } from './utils';
import got from '@/utils/got';
import { load } from 'cheerio';

const host = 'http://www.pbc.gov.cn';

export const route: Route = {
    path: '/pbc/gzlw',
    categories: ['finance'],
    example: '/gov/pbc/gzlw',
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
            source: ['pbc.gov.cn/redianzhuanti/118742/4122386/4122692/index.html'],
        },
    ],
    name: '工作论文',
    maintainers: ['Fatpandac'],
    handler,
    url: 'pbc.gov.cn/redianzhuanti/118742/4122386/4122692/index.html',
};

async function handler() {
    const url = `${host}/redianzhuanti/118742/4122386/4122692/index.html`;

    const response = await got.post(url);
    const $ = load(response.data);
    const list = $('li.clearfix')
        .map((_index, item) => ({
            title: $(item).find('a').text(),
            link: new URL($(item).find('a').attr('href'), host).href,
            author: $(item).find('span.fr').text().replaceAll('…', ''),
        }))
        .get();

    const items = await processItems(list);

    return {
        title: '中国人民银行 工作论文',
        link: url,
        item: items,
    };
}
