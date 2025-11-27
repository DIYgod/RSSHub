import { load } from 'cheerio';
import iconv from 'iconv-lite';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export async function loadDetailPage(link) {
    const response = await got.get(link, {
        responseType: 'buffer',
    });
    response.data = iconv.decode(response.data, 'gb2312');

    const $ = load(response.data);

    return {
        title: $('title')
            .text()
            .replaceAll(/，免费下载，迅雷下载|，6v电影/g, ''),
        description: $('meta[name="description"]').attr('content'),
        enclosure_urls: $('table td')
            .toArray()
            .map((e) => ({
                title: $(e).text().replace('磁力：', ''),
                magnet: $(e).find('a').attr('href'),
            }))
            .filter((item) => item.magnet?.includes('magnet')),
    };
}

export async function processItems(ctx, baseURL, exclude) {
    const response = await got.get(baseURL, {
        responseType: 'buffer',
    });
    response.data = iconv.decode(response.data, 'gb2312');

    const $ = load(response.data);
    const list = $('ul.list')[0].children;

    const process = await Promise.all(
        list.map((item) => {
            const link = $(item).find('a');
            const href = link.attr('href');
            const pubDate = timezone(parseDate($(item).find('span').text().replaceAll(/[[\]]/g, ''), 'MM-DD'), +8);
            const text = link.text();

            if (href === undefined) {
                return;
            }

            if (exclude && exclude.some((e) => e.test(text))) {
                // 过滤掉满足正则的标题条目
                return;
            }

            const itemUrl = 'https://www.hao6v.cc' + link.attr('href');

            return cache.tryGet(itemUrl, async () => {
                const detailInfo = await loadDetailPage(itemUrl);

                if (detailInfo.enclosure_urls.length > 1) {
                    return detailInfo.enclosure_urls.map((url) => ({
                        enclosure_url: url.magnet,
                        enclosure_type: 'application/x-bittorrent',
                        title: `${link.text()} ( ${url.title} )`,
                        description: detailInfo.description,
                        pubDate,
                        link: itemUrl,
                        guid: `${itemUrl}#${url.title}`,
                    }));
                }

                return {
                    enclosure_url: detailInfo.enclosure_urls.length === 0 ? '' : detailInfo.enclosure_urls[0].magnet,
                    enclosure_type: 'application/x-bittorrent',
                    title: link.text(),
                    description: detailInfo.description,
                    pubDate,
                    link: itemUrl,
                };
            });
        })
    );

    return process.filter((item) => item !== undefined).flat();
}
