const got = require('@/utils/got');
const cheerio = require('cheerio');

const title_map = {
    jxtz: '教学通知',
    zjjz: '专家讲座',
};
const description_map = {
    jxtz: '教学通知',
    zjjz: '嘉锡讲坛/信息素养讲座通知',
};

module.exports = async (ctx) => {
    const type = ctx.params.type || '';
    const response = await got({
        method: 'get',
        url: `https://jwch.fzu.edu.cn/${type}.htm`,
    });
    const data = response.data; // 获取页面 html 数据

    const $ = cheerio.load(data);
    const list = $('ul.list-gl'); // <li>s

    const urls = [];

    const url_head = 'https://jwch.fzu.edu.cn/';

    list.find('a').each(function () {
        const a = $(this);
        const url_part = a.attr('href');
        urls.push(url_head + url_part);
    });

    const items = await Promise.all(
        urls.map((item) =>
            ctx.cache.tryGet(item, async () => {
                const response = await got({
                    method: 'get',
                    url: item,
                });
                const $ = cheerio.load(response.data);
                const title = $('title').html();
                const description = $('.articelMain').html();
                const pubDate = $('.xl_sj_icon').text().replace('发布时间：', '');
                return {
                    title,
                    link: item,
                    description,
                    pubDate,
                };
            })
        )
    );

    ctx.state.data = {
        title: `福州大学教务处${title_map[type]}`,
        link: `http://jwch.fzu.edu.cn/${type}`,
        description: `福州大学教务处${description_map[type]}`,
        item: items,
    };
};
