// @ts-nocheck
import cache from '@/utils/cache';
const { joinUrl } = require('./utils');
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import got from '@/utils/got';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const url = `https://www.swpu.edu.cn/scs/index/${ctx.req.param('code')}.htm`;

    const res = await got.get(url);
    const $ = load(res.data);

    const title = $('.r_list > h3').text();

    // 获取标题、时间及链接
    const items = [];
    $('.main_conRCb > ul > li').each((i, elem) => {
        items.push({
            title: $('em', elem).text().trim(),
            pubDate: timezone(parseDate($('span', elem).text()), +8),
            link: joinUrl('https://www.swpu.edu.cn/scs/index/', $('a', elem).attr('href')),
        });
    });

    // 请求全文
    const out = await Promise.all(
        items.map(async (item) => {
            const $ = await cache.tryGet(item.link, async () => {
                const res = await got.get(item.link);
                return load(res.data);
            });

            if ($('title').text().startsWith('系统提示')) {
                item.author = '系统';
                item.description = '无权访问';
            } else {
                item.author = '计算机科学学院';
                item.description = $('.v_news_content').html();
                for (const elem of $('.v_news_content p')) {
                    if ($(elem).css('text-align') === 'right') {
                        item.author = $(elem).text();
                        break;
                    }
                }
            }

            return item;
        })
    );

    ctx.set('data', {
        title: `西南石油大学计算机科学学院 ${title}`,
        link: url,
        description: `西南石油大学计算机科学学院 ${title}`,
        language: 'zh-CN',
        item: out,
    });
};
