const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const base = 'http://www.qdhaici.cn';

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `${base}/news/34`,
    });

    const $ = cheerio.load(response.data);
    const list = $('.p_news.new-lists').children();
    const items = await Promise.all(
        list.map((i, item) => {
            item = $(item);
            const itemTitle = item.find('.p_title.title').text();
            const itemDate = item.find('span').text().slice(2, 12).replace(/' '/g, '');
            const path = item.find('.p_title.title').attr('href');
            let itemUrl = '';
            if (!path.startsWith('http')) {
                itemUrl = base + path;
            } else {
                itemUrl = path;
            }
            return ctx.cache.tryGet(itemUrl, async () => {
                let description = '';
                if (!path.startsWith('http')) {
                    const result = await got(itemUrl);
                    const $ = cheerio.load(result.data);
                    if ($('title').text() === '系统提示') {
                        description = itemTitle;
                    } else {
                        description = $('.newsarticles').html().trim();
                    }
                } else {
                    description = itemTitle;
                }
                return {
                    title: itemTitle,
                    link: itemUrl,
                    pubDate: timezone(parseDate(itemDate), 8),
                    description,
                };
            });
        })
    );

    ctx.state.data = {
        title: '海慈医院 - 人事招聘',
        link: `${base}/news/34`,
        description: '海慈医院 - 人事招聘',
        item: items,
    };
};
