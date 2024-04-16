import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

async function getNoticeList(ctx, url, host, titleSelector, dateSelector, contentSelector) {
    const response = await got({ url, https: { rejectUnauthorized: false } });
    const $ = load(response.data);

    const list = $(`tr[height=20]`)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find(titleSelector).attr('title'),
                link: new URL(item.find(titleSelector).attr('href'), host).href,
                pubDate: timezone(parseDate(item.find(dateSelector).text().trim(), 'YYYY-MM-DD'), +8),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.link.includes('.jsp')) {
                    item.description = '该通知无法直接预览，请点击原文链接↑查看';
                } else {
                    const response = await got({ url: item.link, https: { rejectUnauthorized: false } });
                    if (response.redirectUrls && response.redirectUrls.length > 0) {
                        item.link = response.redirectUrls[0];
                        item.description = '该通知无法直接预览，请点击原文链接↑查看';
                    } else {
                        const $ = load(response.data);
                        item.title = $(contentSelector.title).text();
                        const hasEmbeddedPDFScript = $('script:contains("showVsbpdfIframe")').length > 0;

                        if (hasEmbeddedPDFScript) {
                            item.description = '该通知无法直接预览，请点击原文链接↑查看';
                        } else {
                            const $content = load($(contentSelector.content).html());
                            $content('a').each(function () {
                                const a = $(this);
                                const href = a.attr('href');
                                if (href && !href.startsWith('http')) {
                                    a.attr('href', new URL(href, host).href);
                                }
                            });
                            item.description = $content.html();
                        }
                        const preDate = $(contentSelector.date).text().replaceAll(/年|月/g, '-').replaceAll('日', '');
                        item.pubDate = timezone(parseDate(preDate), +8);
                    }
                }
                return item;
            })
        )
    );

    return out;
}

export { getNoticeList };
