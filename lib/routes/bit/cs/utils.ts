import { load } from 'cheerio';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

// 专门定义一个function用于加载文章内容
async function loadContent(item) {
    // 异步请求文章
    const response = await got(item.link);
    // 加载文章内容
    const $ = load(response.data);

    // 提取作者
    const zuozhe = $('.zuozhe').children().next();
    item.author = zuozhe.first().text();

    // 提取内容
    item.description = $('.wz_art').html();

    // 返回解析的结果
    return item;
}

const ProcessFeed = (list, caches) => {
    const host = 'https://cs.bit.edu.cn/tzgg/';

    return Promise.all(
        // 遍历每一篇文章
        list.map((item) => {
            const $ = load(item);

            const $title = $('a');
            // 还原相对链接为绝对链接
            const itemUrl = new URL($title.attr('href'), host).href;

            // 列表上提取到的信息
            const single = {
                title: $title.text(),
                link: itemUrl,
                // author: '教务部',
                pubDate: timezone(parseDate($('span').text()), 8),
            };

            // 使用tryGet方法从缓存获取内容。
            // 当缓存中无法获取到链接内容的时候，则使用load方法加载文章内容。
            return caches.tryGet(single.link, () => loadContent(single));
        })
    );
};

export default { ProcessFeed };
