import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootURL = 'http://rsj.taiyuan.gov.cn/';

export const route: Route = {
    path: '/taiyuan/rsj/:caty/:page?',
    categories: ['government'],
    example: '/gov/taiyuan/rsj/gggs',
    parameters: { caty: '信息类别', page: '页码' },
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
            source: ['rsj.taiyuan.gov.cn/*'],
        },
    ],
    name: '太原市人力资源和社会保障局政府公开信息',
    maintainers: ['2PoL'],
    handler,
    url: 'rsj.taiyuan.gov.cn/*',
    description: `| 工作动态 | 太原新闻 | 通知公告 | 县区动态 | 国内动态 | 图片新闻 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| gzdt     | tyxw     | gggs     | xqdt     | gndt     | tpxw     |`,
};

async function handler(ctx) {
    const categoryID = ctx.req.param('caty');
    const page = ctx.req.param('page') ?? '1';

    const pageParam = Number.parseInt(page) > 1 ? `_${page}` : '';
    const pagePath = `/zfxxgk/${categoryID}/index${pageParam}.shtml`;

    const currentURL = new URL(pagePath, rootURL);
    const response = await got(currentURL.href);

    if (response.statusCode !== 200) {
        throw new Error(response.statusMessage);
    }

    const $ = load(response.data, { decodeEntities: false });
    const title = $('.tit').find('a:eq(2)').text();
    const list = $('.RightSide_con ul li')
        .toArray()
        .map((item) => {
            const link = $(item).find('a');
            const date = $(item).find('span.fr');
            return {
                title: link.attr('title'),
                link: link.attr('href'),
                pubDate: timezone(parseDate(date.text(), 'YYYY-MM-DD'), +8),
            };
        });

    return {
        title: '太原市人力资源和社会保障局 - ' + title,
        link: currentURL.href,
        item: list,
    };
}
