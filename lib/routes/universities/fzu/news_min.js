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
    const list = $('ul.list-gl').find('li'); // <li>s

    const url_head = 'https://jwch.fzu.edu.cn/';

    ctx.state.data = {
        title: `福州大学教务处${title_map[type]}`,
        link: `http://jwch.fzu.edu.cn/${type}`,
        description: `福州大学教务处${description_map[type]}`,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').attr('title'),
                        discription: item.find('a').attr('title'),
                        link: url_head + item.find('a').attr('href'),
                        pubDate: item.find('span').html(),
                    };
                })
                .get(),
    };
};
