const got = require('@/utils/got');

// 转码需要设定返回数据的格式，其可选项是arraybuffer,blob,document,json,text,stream
// 默认为json
const got_ins = got.extend({ responseType: 'text' });

const api = 'http://www.dean.swust.edu.cn/cms/portal/news.json';
const host = 'http://www.dean.swust.edu.cn/';
const page = 'http://www.dean.swust.edu.cn/news/';

function evil(fn) {
    const Fn = Function; // 一个变量指向Function，防止有些前端编译工具报错
    return new Fn('return ' + fn)();
}

module.exports = async (ctx) => {
    const response = await got_ins.get(api);
    const data = evil(response.data);

    const resultItems = await Promise.all(
        data.map(async (item) => {
            const title = item.title;
            const date = item.outdate;
            const link = page + item.id;
            const author = item.publisher;

            let resultItem = {};

            const value = await ctx.cache.get(link);
            if (value) {
                resultItem = JSON.parse(value);
            } else {
                resultItem = {
                    title: title,
                    link: link,
                    pubDate: new Date(date).toUTCString(),
                    author: author,
                };

                ctx.cache.set(link, JSON.stringify(resultItem));
            }

            return Promise.resolve(resultItem);
        })
    );

    ctx.state.data = {
        title: '西南科技大学教务处 新闻',
        link: host,
        description: '西南科技大学教务处 新闻',
        item: resultItems,
    };
};
