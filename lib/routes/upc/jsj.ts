// @ts-nocheck
import cache from '@/utils/cache';
// 计算机科学与技术学院：http://computer.upc.edu.cn/
// - 学院新闻：http://computer.upc.edu.cn/6277/list.htm
// - 学术关注：http://computer.upc.edu.cn/6278/list.htm
// - 学工动态：http://computer.upc.edu.cn/6279/list.htm
// - 通知公告：http://computer.upc.edu.cn/6280/list.htm

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

// 地址映射
const MAP = {
    news: '6277',
    scholar: '6278',
    states: '6279',
    notice: '6280',
};
// 头部信息
const HEAD = {
    news: '学院新闻',
    scholar: '学术关注',
    states: '学工动态',
    notice: '通知公告',
};

export default async (ctx) => {
    const baseUrl = 'https://computer.upc.edu.cn';
    const type = ctx.req.param('type');
    const link = `${baseUrl}/${MAP[type]}/list.htm`;
    const response = await got({
        method: 'get',
        url: link,
    });
    const $ = load(response.data);
    // ## 获取列表
    const list = $('.list tbody table tr')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a');
            const link = a.attr('href');
            return {
                title: a.attr('title'),
                link: link.startsWith('http') ? link : `${baseUrl}${link}`,
                pubDate: parseDate(item.find('div[style]').text(), 'YYYY-MM-DD'),
            };
        });
    // ## 定义输出的item
    const out = await Promise.all(
        // ### 遍历列表，筛选出自己想要的内容
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                // 获取详情页面的介绍
                const detail_response = await got({
                    method: 'get',
                    url: item.link,
                });
                const $ = load(detail_response.data);
                const detailContent = $('.v_news_content, .wp_articlecontent').html();
                // ### 设置 RSS feed item
                // author,
                item.description = detailContent;
                item.pubDate = $('.nr-xinxi i').first().length ? timezone(parseDate($('.nr-xinxi i').first().text(), 'YYYY-MM-DD HH:mm:ss'), 8) : item.pubDate;
                // // ### 设置缓存
                return item;
            })
        )
    );

    ctx.set('data', {
        title: HEAD[type] + `-计算机科学与技术学院`,
        link,
        description: HEAD[type] + `-计算机科学与技术学院`,
        item: out,
    });
};
