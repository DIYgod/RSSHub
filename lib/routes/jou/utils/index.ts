import { load } from 'cheerio';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch'; // 使用ofetch库
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

async function getItems(ctx, url, host, tableClass, timeStyleClass1, titleStyleClass, timeStyleClass2) {
    const response = await ofetch(url);
    if (!response) {
        return [];
    }
    const $ = load(response);

    const list = $(`table.${tableClass} > tbody > tr[height=20]`)
        .toArray()
        .map((item) => {
            const currentItem = $(item);
            const item1 = currentItem.find('td:eq(1)');
            const item2 = currentItem.find('td:eq(2)');
            const link = new URL(item1.find('a').attr('href'), host).href;

            return {
                title: item1.find('a').attr('title'),
                link,
                pubDate: timezone(parseDate(item2.find(`.${timeStyleClass1}`).text(), 'YYYY-MM-DD'), +8),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                if (!response || (response.status >= 300 && response.status < 400)) {
                    // 响应为空或状态码表明发生了重定向
                    return {
                        ...item,
                        description: '该通知无法直接预览，请点击原文链接↑查看',
                    };
                }
                const $ = load(response);

                item.title = $(`.${titleStyleClass}`).text();
                const hasEmbeddedPDFScript = $('script:contains("showVsbpdfIframe")').length > 0;

                if (hasEmbeddedPDFScript) {
                    item.description = '该通知无法直接预览，请点击原文链接↑查看';
                } else {
                    const contentHtml = $('.v_news_content').html();
                    const $content = load(contentHtml);
                    $content('a').each(function () {
                        const a = $(this);
                        const href = a.attr('href');
                        if (href && !href.startsWith('http')) {
                            a.attr('href', new URL(href, host).href);
                        }
                    });
                    item.description = $content.html();
                }
                item.pubDate = timezone(parseDate($(`.${timeStyleClass2}`).text().replace('发布时间：', '')), +8);

                return item;
            })
        )
    );

    return out;
}

export { getItems };
