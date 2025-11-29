import { load } from 'cheerio';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

// 完整文章页
async function loadContent(link) {
    const response = await got.get(link);

    const data = response.data; // 不用转码

    // 加载文章内容
    const $ = load(data);

    // 提取内容
    const description = ($('#con_c').length ? $('#con_c').html() : '') + ($('#con_fujian').length ? $('#con_fujian').html() : '');

    // 返回解析的结果
    return { description };
}

const ProcessFeed = (base, list, caches) =>
    Promise.all(
        // 遍历每一篇文章
        list.map((item) => {
            const $ = load(item);

            const $title = $('a');
            // 还原相对链接为绝对链接
            const itemUrl = new URL($title.attr('href'), base).href; // 感谢@hoilc指导

            // 解析日期
            const pubDate = timezone(
                parseDate(
                    $('.datetime')
                        .text()
                        .match(/\d{4}-\d{2}-\d{2}/)
                ),
                +8
            );

            // 使用tryGet方法从缓存获取内容。
            // 当缓存中无法获取到链接内容的时候，则使用load方法加载文章内容。
            return caches.tryGet(itemUrl, async () => {
                const { description } = await loadContent(itemUrl);

                // 列表上提取到的信息
                return {
                    title: $title.text(),
                    link: itemUrl,
                    author: '北林教务处',
                    description,
                    pubDate,
                };
            });
        })
    );
export default { ProcessFeed };
