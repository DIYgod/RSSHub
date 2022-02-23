const got = require('@/utils/got');

module.exports = async (ctx) => {
    const type = ctx.params.type === 'all' ? '' : ctx.params.type.toUpperCase();
    const host = `https://td.zjgtjy.cn:8553/devops/noticeInfo/queryNoticeInfoList?pageSize=10&pageNumber=1&noticeType=${type}&sort=DESC`;

    const response = await got({
        method: 'get',
        url: host,
    }).json();
    const data = response.data;

    const items = await Promise.all(
        data.map(async (item) => {
            const pageUrl = `https://td.zjgtjy.cn:8553/devops/noticeInfo/queryNoticeLandContentDetails?noticeId=${item.GGID}&transactionMode=${item.JYFS}`;
            const pageLink = `https://td.zjgtjy.cn/view/trade/announcement/detail?id=${item.GGID}&category=${item.ZYLB}&type=${item.JYFS}`;

            const desc = await ctx.cache.tryGet(pageUrl, async () => {
                let desc = await got({
                    method: 'get',
                    url: pageUrl,
                }).json();
                desc = desc.queryNoticeContent.GGNR;

                desc = desc
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"');
                return desc;
            });

            return {
                title: item.GGMC,
                description: desc,
                link: pageLink,
                pubDate: item.GGFBSJ,
            };
        })
    );

    ctx.state.data = {
        title: '浙江土地使用权挂牌公告',
        link: host,
        item: items,
    };
};
