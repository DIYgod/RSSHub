const got = require('@/utils/got');
const cheerio = require('cheerio');

const notice_type = {
    tzgg: { title: '通知公告', url: 'http://life.hust.edu.cn/tzgg.htm' },
    kxyj: { title: '科学研究', url: 'http://life.hust.edu.cn/kxyj.htm' },
    djgz: { title: '党建工作', url: 'http://life.hust.edu.cn/djgz.htm' },
    xsgz: { title: '学生工作', url: 'http://life.hust.edu.cn/xsgz.htm' },
    rsgz: { title: '人事工作', url: 'http://life.hust.edu.cn/rsgz1.htm' },
    bksjy: { title: '本科生教育', url: 'http://life.hust.edu.cn/bksjy.htm' },
    yjsjy: { title: '研究生教育', url: 'http://life.hust.edu.cn/yjsjy.htm' },
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 'tzgg';
    const link = notice_type[type].url;
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.right_list li');

    ctx.state.data = {
        title: `华科生科院 ${notice_type[type].title}`,
        link: link,
        description: `华科生科院 ${notice_type[type].title}`,
        item:
            list.map((index, item) => {
                item = $(item);
                const month_data = item.find('span').text();
                return {
                    title: item.find('a').text(),
                    description: '请至网页查看全文',
                    link: item.find('a').attr('href'),
                    pubDate: new Date(month_data).toUTCString(),
                };
            })
            .get(),
    };
};
