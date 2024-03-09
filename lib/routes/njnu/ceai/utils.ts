import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

// 专门定义一个function用于加载文章内容
async function loadContent(link) {
    // 异步请求文章
    const response = await got.get(link, {
        https: {
            rejectUnauthorized: false,
        },
    });
    // 加载文章内容
    const $ = load(response.data);
    const dateStr = $('#xw_xinxi span:nth-child(1)').text();
    // 解析日期
    const pubDate = timezone(parseDate(dateStr, 'YYYY-MM-DD', 'zh-cn'), +8);
    // 提取内容
    const description = $('#xw_content').html();

    // 返回解析的结果
    return { description, pubDate };
}

const ProcessFeed = (list, caches) =>
    Promise.all(
        // 遍历每一篇文章
        list.map(async (item) => {
            const $ = load(item);

            const $title = $('a');
            // 还原相对链接为绝对链接
            const itemUrl = $title.attr('href');

            // 列表上提取到的信息
            const single = {
                title: $title.text(),
                link: itemUrl,
                author: '计算机与电子信息学院-人工智能学院',
                guid: itemUrl,
            };

            // 使用tryGet方法从缓存获取内容。
            // 当缓存中无法获取到链接内容的时候，则使用load方法加载文章内容。
            const other = await caches.tryGet(itemUrl, () => loadContent(itemUrl));

            // 合并解析后的结果集作为该篇文章最终的输出结果
            return { ...single, ...other };
        })
    );

export default { ProcessFeed };
