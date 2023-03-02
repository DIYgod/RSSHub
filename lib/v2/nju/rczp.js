const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const title_dict = {
        xxfb: { title: '信息发布', channelid: '9531,9532,9533,9534,9535,9419' },
        jylgw: { title: '教研类岗位', channelid: '9420,9421,9422,9423' },
        gllgw: { title: '管理岗位及其他', channelid: '9424,9425,9426' },
    };
    const link = `https://rczp.nju.edu.cn/sylm/${type}/index.html`;

    const data = await ctx.cache.tryGet(
        `nju:rczp:${type}`,
        async () => {
            const { data } = await got.post('https://rczp.nju.edu.cn/njdx/openapi/t/info/list.do', {
                headers: {
                    referer: link,
                    'x-requested-with': 'XMLHttpRequest',
                },
                form: {
                    channelid: Buffer.from(title_dict[type].channelid).toString('base64'),
                    pagesize: Buffer.from('15').toString('base64'),
                    pageno: Buffer.from('1').toString('base64'),
                    hasPage: Buffer.from('true').toString('base64'),
                },
            });
            return data;
        },
        config.cache.routeExpire,
        false
    );

    const items = data.infolist.map((item) => ({
        title: item.title,
        description: item.summary,
        link: item.url,
        pubDate: parseDate(item.releasetime, 'x'),
        author: item.username,
    }));

    ctx.state.data = {
        title: `人才招聘-${title_dict[type].title}`,
        link,
        item: items,
    };
};
