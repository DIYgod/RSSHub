// @ts-nocheck
import cache from '@/utils/cache';
// 导入got库，该库用来请求网页数据
import got from '@/utils/got';
// 导入cheerio库，该库用来解析网页数据
import { load } from 'cheerio';
// 导入parseDate函数，该函数用于日期处理
import { parseDate } from '@/utils/parse-date';
// 导入timezone库，该库用于时区处理
import timezone from '@/utils/timezone';

async function getItems(ctx, url, host, tableClass, timeStyleClass1, titleStyleClass, timeStyleClass2) {
    // 发起Http请求，获取网页数据
    const response = await got({ url, https: { rejectUnauthorized: false } });
    // 解析网页数据
    const $ = load(response.data);

    // 通知公告的items的标题、url链接、发布日期
    const list = $(`table.${tableClass} > tbody > tr[height=20]`)
        .toArray()
        .map((item) => {
            const currentItem = $(item); // 获取当前tr元素的jQuery对象
            const item1 = currentItem.find('td:eq(1)'); // 获取当前tr元素下的第二个td
            const item2 = currentItem.find('td:eq(2)'); // 获取当前tr元素下的第三个td
            const link = new URL(item1.find('a').attr('href'), host).href;

            return {
                title: item1.find('a').attr('title'),
                link,
                pubDate: timezone(parseDate(item2.find(`.${timeStyleClass1}`).text(), 'YYYY-MM-DD'), +8),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            // 使用缓存
            cache.tryGet(item.link, async () => {
                const response = await got({ url: item.link, https: { rejectUnauthorized: false } });
                if (response.redirectUrls.length) {
                    item.link = response.redirectUrls[0];
                    item.description = '该通知无法直接预览，请点击原文链接↑查看';
                } else {
                    const $ = load(response.data);
                    item.title = $(`.${titleStyleClass}`).text();
                    item.description = $('.v_news_content')
                        .html()
                        .replaceAll('src="/', `src="${new URL('.', host).href}`)
                        .replaceAll('href="/', `href="${new URL('.', host).href}`)
                        .trim();
                    item.pubDate = timezone(parseDate($(`.${timeStyleClass2}`).text().replace('发布时间：', '')), +8);
                }
                return item;
            })
        )
    );

    return out;
}

module.exports = {
    getItems,
};
