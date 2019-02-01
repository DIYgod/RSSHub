const axios = require('../../../utils/axios');

// 转码需要设定返回数据的格式，其可选项是arraybuffer,blob,document,json,text,stream
// 默认为json
const axios_ins = axios.create({ responseType: 'blob' });

const api = 'http://www.dean.swust.edu.cn/cms/portal/notice.json';
const page = 'http://www.dean.swust.edu.cn/notice/page/';
const tag = 'http://www.dean.swust.edu.cn/notice/tag/';

function evil(fn) {
    const Fn = Function; // 一个变量指向Function，防止有些前端编译工具报错
    return new Fn('return ' + fn)();
}

module.exports = async (ctx) => {
    const type = ctx.params.type || 1;

    const response = await axios_ins.get(api);
    const responsedata = evil(response.data);
    const data = responsedata[type - 1];

    const info = data.name || '';
    const tag_url = data.id || '';

    const resultItems = await Promise.all(
        data.items.map(async (item) => {
            const link = page + item.id;
            const author = item.publisher;
            const date = item.outdate;
            const title = item.title;

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

                ctx.cache.set(link, JSON.stringify(resultItem), 24 * 60 * 60);
            }

            return Promise.resolve(resultItem);
        })
    );

    ctx.state.data = {
        title: '西南科技大学教务处 ' + info,
        link: tag + tag_url,
        description: `西南科技大学教务处 ${info}`,
        item: resultItems,
    };
};
