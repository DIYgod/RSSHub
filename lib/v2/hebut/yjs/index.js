const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yjs.hebut.edu.cn/';

module.exports = async (ctx) => {
    const { type } = ctx.request.params;
    const response = await got(`${host}/zsgz/${type}/index.htm`);
    const $ = cheerio.load(response.data);
    let list = [];
    if (type === 'zsgztzgg') {
        list = $('.t_list_main_2 ul li');
    } else {
        list = $('.list1_main_rt_2_2 ul li');
    }
    const items = await Promise.all(
        list.map((i, item) => {
            item = $(item);
            const itemTitle = item.find('a').text();
            const itemDate = item.find('span').text().replace('[', '').replace(']', '');
            const itemPath = item.find('a').attr('href');
            let itemUrl = '';
            if (itemPath.startsWith('http')) {
                itemUrl = itemPath;
            } else if (itemPath.startsWith('../../')) {
                itemUrl = itemPath.replace(/..\/..\//g, host);
            } else if (itemPath.startsWith('../')) {
                itemUrl = itemPath.replace(/..\//g, host);
            } else {
                itemUrl = `${host}zsgz/${type}/${itemPath}`;
            }
            return ctx.cache.tryGet(itemUrl, async () => {
                let description = '';
                try {
                    const result = await got(itemUrl);
                    const $ = cheerio.load(result.data);
                    description = $('.wenzhang2').html().trim();
                } catch (err) {
                    description = itemTitle;
                }
                return {
                    title: itemTitle,
                    link: itemUrl,
                    pubDate: parseDate(itemDate),
                    description,
                };
            });
        })
    );

    ctx.state.data = {
        title: '河北工业大学研究生院 - 招生工作',
        link: `${host}/zsgz/${type}/index.htm`,
        description: '河北工业大学研究生院 - 招生工作',
        item: items,
    };
};
