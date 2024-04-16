import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

async function getNoticeList(ctx, url, host, titleSelector, dateSelector, contentSelector, listSelector) {
    const response = await got(url);
    const $ = load(response.data);

    const list = $(listSelector)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find(titleSelector).attr('title'),
                link: host + item.find(titleSelector).attr('href'),
                pubDate: timezone(parseDate(item.find(dateSelector).text(), 'YYYY-MM-DD'), +8),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                if (response.redirectUrls && response.redirectUrls.length > 0) {
                    item.description = '该通知无法直接预览，请点击原文链接↑查看';
                } else {
                    const $ = load(response.data);
                    if ($('.wp_error_msg').length > 0) {
                        item.description = '您当前ip并非校内地址，该信息仅允许校内地址访问';
                    } else {
                        const contentHtml = $(contentSelector.content).html();
                        const $content = load(contentHtml);

                        if ($content('.wp_pdf_player').length > 0) {
                            item.description = '该通知无法直接预览，请点击原文链接↑查看';
                        } else {
                            $content('a').each(function () {
                                const a = $(this);
                                const href = a.attr('href');
                                if (href && !href.startsWith('http')) {
                                    a.attr('href', new URL(href, host).href);
                                }
                            });
                            item.description = $content.html();
                        }

                        item.title = $(contentSelector.title).text();
                        const dateText = $(contentSelector.date).text().replace('编辑：', '').replace('发布日期：', '').replace('发布时间：', '');
                        item.pubDate = timezone(parseDate(dateText, 'YYYY-MM-DD'), +8);
                    }
                }
                return item;
            })
        )
    );

    return out;
}

export { getNoticeList };
