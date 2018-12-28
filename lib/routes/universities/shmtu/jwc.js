const axios = require('../../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const host = 'http://jwc.shmtu.edu.cn/Information/';
    let type = ctx.params.type;
    let info = '教务新闻';
    if (type === '2') {
        info = '教务公告';
    } else {
        type = '1';
    }

    const response = await axios({
        method: 'get',
        url: host + `MoreInfo.aspx?type=${type}`,
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);
    const text = $('.gvRow', '.tdMCViewList');

    ctx.state.data = {
        title: `上海海事大学 ${info}`,
        link: host + `MoreInfo.aspx?type=${type}`,
        description: `上海海事大学 ${info}`,
        item:
            text &&
            text
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').attr('title'),
                        description: item.find('a').attr('title'),
                        author:
                            '信息类别 - ' +
                            $('.gvItemNormal', item)
                                .slice(1, 2)
                                .text()
                                .trim(),
                        pubDate: $('.gvItemNormal', item)
                            .slice(4)
                            .text()
                            .trim(),
                        link: (host + item.find('a').attr('href')).replace('/Information/..', ''),
                    };
                })
                .get(),
    };
};
