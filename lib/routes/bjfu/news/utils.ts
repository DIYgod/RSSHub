import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

// 完整文章页
async function loadContent(link) {
    const response = await got.get(link);

    const data = response.data; // 不用转码

    // 加载文章内容
    const $ = load(data);

    // 解析日期
    const pubDate = timezone(
        parseDate(
            $('.article')
                .text()
                .match(/\d{4}(?:\/\d{2}){2}/)
        ),
        +8
    );

    // 提取内容
    const description = $('.article_con').html();
    const title = $('h2').text();

    // 返回解析的结果
    return { description, pubDate, title };
}

const ProcessFeed = (base, list, caches) =>
    Promise.all(
        // 遍历每一篇文章
        list.map((item) => {
            const $ = load(item);

            const $title = $('a');
            // 还原相对链接为绝对链接
            const itemUrl = new URL($title.attr('href'), base).href; // 感谢@hoilc指导

            // 使用tryGet方法从缓存获取内容。
            // 当缓存中无法获取到链接内容的时候，则使用load方法加载文章内容。
            return caches.tryGet(itemUrl, async () => {
                const { description, pubDate, title } = await loadContent(itemUrl);

                // 列表上提取到的信息
                return {
                    title: $title.text().includes('...') ? title : $title.text(),
                    link: itemUrl,
                    author: '绿色新闻网',
                    description,
                    pubDate,
                };
            });
        })
    );
export default { ProcessFeed };
