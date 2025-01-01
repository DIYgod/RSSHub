import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';

const categoryMap = {
    xsyg: { title: '学术预告', tag: '30284' },
    jytz: { title: '教研通知', tag: '30307' },
    hwxx: { title: '海外学习', tag: 'hwxx' },
    swtz: { title: '事务通知', tag: '30283' },
};

export const route: Route = {
    path: '/gzic/notice/:category?',
    categories: ['university'],
    example: '/scut/gzic/notice/swtz',
    parameters: { category: '通知分类，默认为 `swtz`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '广州国际校区 - 通知公告',
    maintainers: ['gdzhht'],
    handler,
    description: `| 学术预告 | 教研通知 | 海外学习 | 事务通知 |
  | -------- | -------- | -------- | -------- |
  | xsyg     | jytz     | hwxx     | swtz     |

::: warning
由于学校网站对非大陆 IP 的访问存在限制，可能需自行部署。
部分通知详情页可能会被删除（返回 404），或在校园网外无法访问。
:::`,
};

async function handler(ctx) {
    const baseUrl = 'https://www2.scut.edu.cn';

    const categoryName = ctx.req.param('category') || 'swtz';
    const categoryMeta = categoryMap[categoryName];
    const url = `${baseUrl}/gzic/${categoryMeta.tag}/list.htm`;

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
                link: a.attr('href')?.startsWith('http') ? a.attr('href') : `${baseUrl}${a.attr('href')}`,
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
        title: `华南理工大学广州国际校区 - ${categoryMeta.title}`,
        link: url,
        item: items,
    };
}
