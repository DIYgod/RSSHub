import { load } from 'cheerio';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

// 加载文章页
const loadContent = async (link) => {
    const response = await got.get(link);
    const $ = load(response.data);
    // 解析日期
    const pubDate = timezone(parseDate($('time').attr('datetime')), +8);
    // 去除样式
    $('.image-container, .image-container-fill').removeAttr('style');
    // 处理视频
    $('.video-package').each((index, elem) => {
        const $item = $(elem);
        const desc = $item.find('.video-description').html();
        const url = $item.attr('data-video-url');

        $item.html(`
            <p>${desc}</p>
            <iframe frameborder="0" src="${url}" allowFullScreen="true"></iframe>
        `);
    });
    // 提取内容
    const description = $('article').html();

    return { description, pubDate };
};

const ProcessFeed = (list, caches) => {
    const host = 'https://www.jianshu.com';

    return Promise.all(
        list.map((item) => {
            const $ = load(item);
            const $title = $('.title');
            // 还原相对链接为绝对链接
            const itemUrl = new URL($title.attr('href'), host).toString();
            // 使用tryGet方法从缓存获取内容。
            // 当缓存中无法获取到链接内容的时候，则使用load方法加载文章内容
            return caches.tryGet(itemUrl, async () => {
                const other = await loadContent(itemUrl);
                // 合并解析后的结果集作为该篇文章最终的输出结果
                return {
                    title: $title.text(),
                    link: itemUrl,
                    author: $('.nickname').text(),
                    ...other,
                };
            });
        })
    );
};

export default { ProcessFeed };
