import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/gzic/media',
    categories: ['university'],
    example: '/scut/gzic/media',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '广州国际校区 - 媒体报道',
    maintainers: ['gdzhht'],
    handler,
    description: `::: warning
由于学校网站对非大陆 IP 的访问存在限制，可能需自行部署。
:::`,
};

async function handler() {
    const url = 'https://www2.scut.edu.cn/gzic/30281/list.htm';

    const { data: response } = await got(url);
    const $ = load(response);

    const list = $('.right-nr .row .col-lg-4')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('.thr-box a');
            const pubDate = item.find('.thr-box a span');
            return {
                title: item.find('.thr-box a p').text(),
                link: a.attr('href')?.startsWith('http') ? a.attr('href') : `https://www2.scut.edu.cn${a.attr('href')}`,
                pubDate: parseDate(pubDate.text()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const response = await ofetch(item.link);
                    const $ = load(response);
                    item.description = $('div.wp_articlecontent').html();
                } catch (error) {
                    if (error.response && error.response.status === 404) {
                        item.description = '';
                    } else {
                        throw error;
                    }
                }
                return item;
            })
        )
    );

    return {
        title: '华南理工大学广州国际校区 - 媒体报道',
        link: url,
        item: items,
    };
}
