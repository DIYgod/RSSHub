const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://www.etoland.co.kr/bbs/board.php?bo_table=star01',
        responseType: 'buffer',
    });

    const data = iconv.decode(response.data, 'euc-kr');

    const $ = cheerio.load(data);
    const list = $('form[name="fboardlist"]>table tr[align="center"]').filter((index, item) => {
        item = $(item);
        return item.find('td').first().find('span.mw_basic_list_num').length > 0;
    });

    ctx.state.data = {
        title: 'etoland',
        link: 'http://www.etoland.co.kr/bbs/board.php?bo_table=star01',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const title = item.find('td.mw_basic_list_subject a:nth-child(3) span').text();
                    const description = `点赞数：${item.find('td.mw_basic_list_good').text()}<br>浏览数：${item.find('td.mw_basic_list_hit').text()}`;
                    const link = item.find('td.mw_basic_list_subject a:nth-child(3)').attr('href');

                    return {
                        title: title,
                        description: description,
                        link: link,
                        pubDate: date(item.find('td.mw_basic_list_datetime').text()),
                    };
                })
                .get(),
    };
};
