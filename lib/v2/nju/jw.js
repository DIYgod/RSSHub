const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const type_dict = {
        ggtz: [
            26263, // columnID
            '公告通知', // type name
            '[{"field":"top","type":"desc"},{"field":"new","type":"desc"},{"field":"publishTime","type":"desc"}]', // order
            '[{"field":"title","name":"title"},{"field":"f1","name":"f1"},{"field":"publishTime","pattern":[{"name":"d","value":"yyyy-MM-dd HH:mm:ss"}],"name":"publishTime"},{"field":"link","name":"link"}]', // returnInfos
            'https://jw.nju.edu.cn/ggtz/list.htm',
        ],
        jxdt: [
            24774,
            '教学动态',
            '[{"field":"top","type":"desc"},{"field":"new","type":"desc"},{"field":"publishTime","type":"desc"}]',
            '[{"field":"title","name":"title"},{"field":"publishTime","pattern":[{"name":"d","value":"yyyy-MM-dd HH:mm:ss"}],"name":"publishTime"},{"field":"link","name":"link"}]',
            'https://jw.nju.edu.cn/_s414/24774/list.psp',
        ],
    };
    const { data } = await got({
        method: 'post',
        url: 'https://jw.nju.edu.cn/_wp3services/generalQuery?queryObj=articles',
        form: {
            siteId: 414,
            columnId: type_dict[type][0],
            pageIndex: 1,
            rows: 24, // 用大一点的值，因为前面太多置顶的
            orders: type_dict[type][2],
            returnInfos: type_dict[type][3],
        },
        headers: {
            Origin: 'https://jw.nju.edu.cn',
            Referer: 'https://jw.nju.edu.cn/main.htm',
        },
    });

    ctx.state.data = {
        title: `本科生院-${type_dict[type][1]}`,
        link: type_dict[type][4],
        item:
            data &&
            data.data &&
            data.data.map((item) => {
                const ret = {
                    title: item.title,
                    author: item.publisher,
                    pubDate: timezone(parseDate(item.publishTime, 'YYYY-MM-DD HH:mm:ss'), +8),
                    link: item.url,
                };
                if (type === 'ggtz') {
                    ret.category = item.f1;
                }
                return ret;
            }),
    };
};
