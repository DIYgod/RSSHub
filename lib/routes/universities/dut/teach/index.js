const got = require('@/utils/got');
const cheerio = require('cheerio');
const typeMap = new Map([
    ['zytg', { title: '大连理工大学教务处-重要通知', url: 'https://teach.dlut.edu.cn/zytg/zytg.htm' }],
    ['qitawenjian', { title: '大连理工大学教务处-其他文件', url: 'https://teach.dlut.edu.cn/qitawenjian/list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1081' }],
    ['jiaoxuewenjian', { title: '大连理工大学教务处-教学文件', url: 'https://teach.dlut.edu.cn/jiaoxuewenjian/list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1082' }],
]);
module.exports = async (ctx) => {
    const baseUrl = typeMap.get(ctx.params.type).url;
    const response = await got({
        method: 'get',
        url: baseUrl,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.list > ul > li');

    ctx.state.data = {
        title: typeMap.get(ctx.params.type).title,
        link: baseUrl,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').attr('title'),
                        description: '',
                        link: item.find('a').attr('href'),
                    };
                })
                .get(),
    };
};
