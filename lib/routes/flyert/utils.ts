import got from '@/utils/got';
import { load } from 'cheerio';
import * as url from 'node:url';
import iconv from 'iconv-lite';

const gbk2utf8 = (s) => iconv.decode(s, 'gbk');

// 加载文章页
async function loadContent(link) {
    const response = await got.get(link, {
        responseType: 'buffer',
    });
    const $ = load(gbk2utf8(response.data));

    // 去除全文末尾多与内容
    $('.lookMore').remove();
    $('script, style').remove();
    $('#loginDialog').remove();

    // 获取第一个帖子对象
    const firstpost = $('.firstpost');

    // 修改图片中的链接
    firstpost.find('ignore_js_op img').each(function () {
        $(this).attr('src', $(this).attr('file'));
        // remove useless atrributes
        for (const attr of ['id', 'aid', 'zoomfile', 'file', 'zoomfile', 'class', 'onclick', 'title', 'inpost', 'alt', 'onmouseover']) {
            $(this).removeAttr(attr);
        }
    });

    // 去除全文中图片的多余标签
    const images = firstpost.find('ignore_js_op img');
    firstpost.find('ignore_js_op').remove();
    firstpost.append(images);

    // // 提取内容
    const description = firstpost.html();

    return { description };
}

const ProcessFeed = (list, caches) => {
    const host = 'https://www.flyert.com';

    return Promise.all(
        list.map(async (item) => {
            const $ = load(item);

            const $label = $(".comiis_common a[data-track='版块页主题分类']");
            const $title = $(".comiis_common a[data-track='版块页文章']");
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
            const other = await caches.tryGet(itemUrl, () => loadContent(itemUrl));

            // 合并解析后的结果集作为该篇文章最终的输出结果
            return Object.assign({}, single, other);
        })
    );
};

export default { ProcessFeed };
