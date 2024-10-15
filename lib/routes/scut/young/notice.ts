import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/young/notice',
    categories: ['university'],
    example: '/scut/young/notice',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '校团委 - 通知公告',
    maintainers: ['gdzhht'],
    handler,
    description: `:::warning
由于学校网站对非大陆 IP 的访问存在限制，可能需自行部署。
:::`,
};

async function handler() {
    const baseUrl = 'https://www2.scut.edu.cn';
    const url = 'https://www2.scut.edu.cn/youth/tzgg/list.htm';

    const { data: response } = await got(url);
    const $ = load(response);

    const list = $('#wp_news_w3 ul li')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('li  a');
            return {
                title: item.find('li a .title span').text(),
                link: a.attr('href')?.startsWith('http') ? a.attr('href') : `${baseUrl}${a.attr('href')}`,
                pubDate: parseDate(item.find('li a .date').text(), 'YYYY-MM-DD'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                item.description = $('div.wp_articlecontent').html();
                return item;
            })
        )
    );

    return {
        title: '共青团华南理工大学委员会 - 通知公告',
        link: url,
        item: items,
    };
}
