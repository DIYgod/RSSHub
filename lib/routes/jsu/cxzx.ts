// @ts-nocheck
import cache from '@/utils/cache';
// 导入必要的模组
import got from '@/utils/got'; // 自订的 got
import { load } from 'cheerio'; // 可以使用类似 jQuery 的 API HTML 解析器
import { parseDate } from '@/utils/parse-date';
const { getPageItemAndDate } = require('./utils/index');

export default async (ctx) => {
    // 在此处编写您的逻辑
    const { types = 'xkjs' } = ctx.req.param();
    const baseUrl = 'https://cxzx.jsu.edu.cn/';
    const urls = {
        tzgg: {
            url: 'https://cxzx.jsu.edu.cn/xwzx.htm',
            title: '通知公告',
        }, // 通知公告页面
        xkjs: {
            url: 'https://cxzx.jsu.edu.cn/xwzx/zxdt.htm',
            title: '学科竞赛公告',
        },
        cxtz: {
            url: 'https://cxzx.jsu.edu.cn/cxlt/xsjz1.htm',
            title: '创新项目公告',
        },
        jsxw: {
            url: 'https://cxzx.jsu.edu.cn/cxjs.htm',
            title: '竞赛新闻',
        },
        jstz: {
            url: 'https://cxzx.jsu.edu.cn/cxjs/xkjs.htm',
            title: '竞赛新闻 -> 通知公告',
        },
    };
    // 获取页面中所有的 body > div.cx_big_container > div.cx_content_container > div.cx_right_part > div.cx_article_list_box > table > tbody > tr
    const response = await got({
        method: 'get',
        url: urls[types].url,
    });

    const $ = load(response.data);
    const list = $('tr[height="20"]').toArray();

    const out = await Promise.all(
        list.map((item) => {
            item = $(item);
            const link = new URL(item.find('td:nth-child(2) > a').attr('href'), baseUrl).href;
            return cache.tryGet(link, async () => {
                const title = item.find('td:nth-child(2) > a').text() || '无标题';

                const category = urls[types].title;
                const description = await getPageItemAndDate(
                    '#vsb_newscontent',
                    link,
                    'body > div.cx_big_container > div.cx_content_container > div.cx_right_part > div.viewbox > form > table > tbody > tr:nth-child(1) > td',
                    'body > div.cx_big_container > div.cx_content_container > div.cx_right_part > div.viewbox > form > table > tbody > tr:nth-child(2) > td > span.timestyle134612'
                );
                const pubDate = parseDate(description.date);
                return {
                    title,
                    link,
                    pubDate,
                    description: description.pageInfo,
                    category,
                };
            });
        })
    );

    ctx.set('data', {
        // 在此处输出您的 RSS
        title: `吉首大学创新中心 - ${urls[types].title}`,
        link: urls[types].url,
        description: '吉首大学创新中心',
        item: out,
    });
};
