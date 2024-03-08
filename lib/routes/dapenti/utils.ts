import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import iconv from 'iconv-lite';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default {
    parseFeed: async ({ subjectid }) => {
        const url = `https://www.dapenti.com/blog/blog.asp?name=xilei&subjectid=${subjectid}`;
        const listRes = await got({
            method: 'get',
            url,
            headers: {
                Referer: url,
            },
            // 喷嚏网编码为GBK，需要转码
            // 转码需要设定返回数据的格式，其可选项是arraybuffer,blob,document,json,text,stream
            // 默认为json
            responseType: 'buffer',
        });
        // 转码
        const data = iconv.decode(listRes.data, 'gb2312');
        const $ = load(data);
        // 只取最近的三个，取全文rss
        const list = $('li', 'ul').slice(0, 3).get();

        const result_item = await Promise.all(
            list.map((item) =>
                cache.tryGet(`https://www.dapenti.com/blog/${$(item).find('a').attr('href')}`, async () => {
                    const el = $(item);
                    const url = `https://www.dapenti.com/blog/${el.find('a').attr('href')}`;
                    const original_data = await got({
                        method: 'get',
                        url,
                        headers: {
                            Referer: url,
                        },
                        responseType: 'buffer',
                    });
                    const convert_data = iconv.decode(original_data.data, 'gbk');
                    const description = load(convert_data, {
                        decodeEntities: false,
                    })('body > table > tbody > tr > td.oblog_t_2 > div > table > tbody > tr:nth-child(2) > td');
                    const pubInfo = description.find('span span.oblog_text').text().split('发布于');
                    description.find('table, .adsbygoogle').remove();

                    // remove header
                    const count = subjectid.toString() === '70' ? 7 : 3;
                    for (let index = 0; index < count; index++) {
                        description.children().first().remove();
                    }

                    // remove footer
                    for (let index = 0; index < 8; index++) {
                        description.children().last().remove();
                    }
                    const single = {
                        title: el.text(),
                        author: pubInfo[0].trim(),
                        description: description.html(),
                        pubDate: timezone(parseDate(pubInfo[1]?.trim()), +8),
                        link: url,
                    };
                    return single;
                })
            )
        );

        return {
            title: `喷嚏-${subjectid}`,
            link: url,
            item: result_item,
        };
    },
};
