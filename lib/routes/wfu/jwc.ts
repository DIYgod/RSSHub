// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';

// 参考 whu/news 武汉大学页面写成

const baseUrl = 'https://jwc.wfu.edu.cn/3742/list.htm';
const sizeTitle = '潍坊学院教务处新闻';

export default async (ctx) => {
    const response = await got({
        method: 'get',
        url: baseUrl,
        headers: {
            Referer: 'https://jwc.wfu.edu.cn/',
        },
    });
    const $ = load(response.data);

    // 获取当前页面的 list
    const list = $('ul.wp_article_list>li');

    const result = await Promise.all(
        // 遍历每一篇文章
        list
            .map((item) => {
                const $ = load(list[item]); // 将列表项加载成 html
                const $article_title = $('div.pr_fields>span.Article_Title>a');
                const $item_url = 'https://jwc.wfu.edu.cn/' + $article_title.attr('href'); // 获取 每一项的url
                const $title = $article_title.text(); // 获取每个的标题
                const $description = $('div.pr_fields>span.Article_Title').html();

                // 列表上提取到的信息
                // 教务处通知为文件，直接提供下载链接
                // 标题 链接
                const single = {
                    title: $title,
                    link: $item_url,
                    guid: $item_url,
                    description: $description,
                };

                // 合并解析后的结果集作为该篇文章最终的输出结果
                return single;
            })
            .get()
    );

    ctx.set('data', {
        title: sizeTitle,
        link: baseUrl,
        description: '潍坊学院教务处通知（通知为文件需下载）',
        item: result,
    });
};
