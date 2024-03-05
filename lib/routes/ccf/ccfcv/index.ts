// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

const rootUrl = 'https://tc.ccf.org.cn';

const cateTitleMap = {
    xsdt: {
        xsqy: '学术前沿',
        rdzw: '热点征文',
        xshy: '学术会议',
    },
};

export default async (ctx) => {
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
                        item.description = art(path.join(__dirname, '../templates/ccfcv/description.art'), {
                            pdfUrl,
                        });
                    }

                    delete item.status;
                    return item;
                })
            )
        );
    }

    ctx.set('data', {
        title: `计算机视觉专委 - ${cateTitleMap[channel][cate]}`,
        link: url,
        item: items,
    });
};
