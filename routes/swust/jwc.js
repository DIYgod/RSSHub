const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    const host = 'http://www.dean.swust.edu.cn';
    let type = ctx.params.type;

    let info = '通知公告';
    let word = 'notices/';

    if (type === '2') {
        info = '站点新闻';
        word = 'news/';
    } else {
        type = '1';
    }

    const web = 'http://www.dean.swust.edu.cn/xml/' + word + 'index.xml';
    const response = await axios({
        method: 'get',
        url: web,
        headers: {
            'User-Agent': config.ua,
            Referer: host,
        },
    });

    const data = response.data;

    const $ = cheerio.load(data, {
        xmlMode: true,
    });
    const list = $('entrity');

    ctx.state.data = {
        title: '西南科技大学 教务处 ' + info,
        link: web,
        description: $('title')
            .first()
            .text(),
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('title').text(),
                        description: item.find('summary').text(),
                        pubDate: new Date(
                            Date.parse(
                                item
                                    .find('date')
                                    .text()
                                    .replace('年', '-')
                                    .replace('月', '-')
                                    .replace('日', '')
                            )
                        ),
                        link: host + '/xml/' + word + item.attr('id') + '.xml',
                    };
                })
                .get(),
    };
};
