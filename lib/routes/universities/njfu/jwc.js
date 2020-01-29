const got = require('@/utils/got');
const cheerio = require('cheerio');

const url = 'http://jwc.njfu.edu.cn//c';
const map = {
    1798: '校级发文',
    1799: '通知公告',
    2270: '上级发文',
    1797: '下载专区',
};

module.exports = async (ctx) => {
    const category = map.hasOwnProperty(ctx.params.category) ? ctx.params.category : 1799;
    const response = await got({
        method: 'get',
        url: url + category + '/index.html',
    });

    const $ = cheerio.load(response.data);
    const list = $('.List_R4');

    ctx.state.data = {
        title: '南京林业大学教务处-' + map[category],
        link: url + category + '/index.html',
        description: '南京林业大学教务处-' + map[category] + 'Rss源',
        item: list
            .map((index, item) => ({
                title: $(item)
                    .find('a')
                    .attr('title'),
                description: $(item)
                    .find('a')
                    .attr('title'),
                pubDate: $(item)
                    .find('.List_R4_R')
                    .text()
                    .replace(/\[|]/g, ''),
                link: $(item)
                    .find('a')
                    .attr('href'),
            }))
            .get(),
    };
};
