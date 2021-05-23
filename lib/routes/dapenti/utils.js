const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = {
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
        const $ = cheerio.load(data);
        // 只取最近的三个，取全文rss
        const list = $('li', 'ul').slice(0, 3).get();

        const result_item = await Promise.all(
            list.map(async (item) => {
                const el = $(item);
                const url = `https://www.dapenti.com/blog/${el.find('a').attr('href')}`;
                const original_data = await got({
                    method: 'get',
                    url: url,
                    headers: {
                        Referer: url,
                    },
                    responseType: 'buffer',
                });
                const convert_data = iconv.decode(original_data.data, 'gbk');
                const description = cheerio.load(convert_data, {
                    decodeEntities: false,
                })('body > table > tbody > tr > td.oblog_t_2 > div > table > tbody > tr:nth-child(2) > td');
                description.find('table, .adsbygoogle').remove();

                // remove header
                const count = subjectid.toString() === '70' ? 8 : 3;
                for (let index = 0; index < count; index++) {
                    description.children().first().remove();
                }

                // remove footer
                for (let index = 0; index < 8; index++) {
                    description.children().last().remove();
                }
                const single = {
                    title: el.text(),
                    description: description.html(),
                    link: url,
                };
                return Promise.resolve(single);
            })
        );

        return {
            title: `喷嚏-${subjectid}`,
            link: url,
            item: result_item,
        };
    },
};
