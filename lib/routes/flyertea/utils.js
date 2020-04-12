const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const iconv = require('iconv-lite');

// 加载文章页
async function load(link) {
    const response = await got.get(link, {
        responseType: 'buffer',
    });
    const gbk2utf8 = (s) => iconv.decode(s, 'gbk');
    const $ = cheerio.load(gbk2utf8(response.data));

    // 去除全文末尾多与内容
    $('.lookMore').remove();
    $('script').remove();

    // 修改图片中的链接
    $('ignore_js_op img').each(function () {
        const new_src = $('ignore_js_op img').attr('file');
        $(this).attr('src', new_src);
    });

    // 去除全文中图片的多余标签
    const images = $('ignore_js_op img');
    $('ignore_js_op').remove();
    $("[class*='post_message']").append(images);

    // 提取内容
    const description = $("[class*='post_message']").html();

    return { description };
}

const ProcessFeed = async (list, caches) => {
    const host = 'https://www.flyertea.com';

    return await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const $label = $(".comiis_common a[data-track='版块页主题分类']");
            const $title = $(".comiis_common a[data-track='版块页帖子']");
            // 还原相对链接为绝对链接
            const itemUrl = url.resolve(host, $title.attr('href'));

            // 列表上提取到的信息
            const single = {
                title: $label.text() + '-' + $title.text(),
                link: itemUrl,
                guid: itemUrl,
            };

            // 使用tryGet方法从缓存获取内容。
            // 当缓存中无法获取到链接内容的时候，则使用load方法加载文章内容。
            const other = await caches.tryGet(itemUrl, async () => await load(itemUrl));

            // 合并解析后的结果集作为该篇文章最终的输出结果
            return Promise.resolve(Object.assign({}, single, other));
        })
    );
};

module.exports = {
    ProcessFeed,
};
