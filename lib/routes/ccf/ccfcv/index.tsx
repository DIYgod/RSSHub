import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://tc.ccf.org.cn';

const cateTitleMap = {
    xsdt: {
        xsqy: '学术前沿',
        rdzw: '热点征文',
        xshy: '学术会议',
    },
};

export const route: Route = {
    path: '/ccfcv/:channel/:category',
    categories: ['study'],
    example: '/ccf/ccfcv/xsdt/xsqy',
    parameters: { channel: '频道，仅支持 `xsdt`', category: '分类，见下表，亦可在网站 url 里找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '计算机视觉专委会 - 学术动态 - 分类',
    maintainers: ['elxy'],
    handler,
    description: `| 学术前沿 | 热点征文 | 学术会议 |
| -------- | -------- | -------- |
| xsqy     | rdzw     | xshy     |`,
};

async function handler(ctx) {
    const channel = ctx.req.param('channel');
    const cate = ctx.req.param('category');

    const url = `${rootUrl}/ccfcv/${channel}/${cate}/`;
    const response = await got(url);
    const $ = load(response.data);

    let items = $('div.article-item')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h3 a').text(),
                link: (cate === 'xsqy' ? rootUrl : '') + item.find('h3 a').attr('href'),
                pubDate: parseDate(item.find('div p').text()),
            };
        });

    if (cate === 'xsqy') {
        items = await Promise.all(
            items.map((item) =>
                cache.tryGet(item.link, async () => {
                    let detailResponse;

                    try {
                        detailResponse = await got(item.link);
                    } catch {
                        item.status = 404;
                    }

                    if (item.status !== 404) {
                        const content = load(detailResponse.data);
                        const pdfUrl = content('div.g-box1 p a').attr('href');
                        item.description = renderToString(
                            <center>
                                <embed src={pdfUrl} />
                            </center>
                        );
                    }

                    delete item.status;
                    return item;
                })
            )
        );
    }

    return {
        title: `计算机视觉专委 - ${cateTitleMap[channel][cate]}`,
        link: url,
        item: items,
    };
}
