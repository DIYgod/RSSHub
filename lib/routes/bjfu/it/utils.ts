// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
const iconv = require('iconv-lite');
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

// 完整文章页
async function loadContent(link) {
    let response;
    try {
        response = await got.get(link, {
            responseType: 'buffer',
        });
    } catch {
        return { description: '' };
    }

    const data = response.data; // 不用转码

    // 加载文章内容
    let $ = load(iconv.decode(data, 'utf-8'));
    const charset = $('meta[charset]').attr('charset');
    if (charset?.toLowerCase() !== 'utf-8') {
        $ = load(iconv.decode(data, charset ?? 'utf-8'));
    }

    // 提取内容
    const description = ($('.template-body').length ? $('.template-body').html() : '') + ($('.template-tail').length ? $('.template-tail').html() : '');

    // 返回解析的结果
    return { description };
}

const ProcessFeed = (base, list, caches) =>
    // 使用 Promise.all() 进行 async 并发
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
                    $('span')
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
                    author: '北林信息',
                    description,
                    pubDate,
                };
            });
        })
    );
module.exports = {
    ProcessFeed,
};
