const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const listRes = await axios({
        method: 'get',
        url: 'https://www.dapenti.com/blog/blog.asp?name=xilei&subjectid=70',
        headers: {
            Referer: 'https://www.dapenti.com/blog/blog.asp?name=xilei&subjectid=70',
        },
        // 喷嚏网编码为GBK，需要转码
        // 转码需要设定返回数据的格式，其可选项是arraybuffer,blob,document,json,text,stream
        // 默认为json
        responseType: 'arraybuffer',
    });
    // 转码
    const data = iconv.decode(listRes.data, 'gb2312');
    const $ = cheerio.load(data);
    // 只取最近的三个图卦，取全文rss
    const list = $('li', 'ul')
        .slice(0, 3)
        .get();

    const result_item = await Promise.all(
        list.map(async (item) => {
            const el = $(item);
            const url = `https://www.dapenti.com/blog/${el.find('a').attr('href')}`;
            const original_data = await axios({
                method: 'get',
                url: url,
                headers: {
                    Referer: url,
                },
                responseType: 'arraybuffer',
            });
            const convert_data = iconv.decode(original_data.data, 'gbk');
            const detail_data = cheerio
                .load(convert_data, {
                    decodeEntities: false,
                })('div[class="oblog_text"]')
                .html();
            const single = {
                title: el.text(),
                description: detail_data,
                link: url,
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '喷嚏图卦',
        link: 'https://www.dapenti.com/blog/blog.asp?name=xilei&subjectid=70',
        description: '喷嚏图卦',
        item: result_item,
    };
};
