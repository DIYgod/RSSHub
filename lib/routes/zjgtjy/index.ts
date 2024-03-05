// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';

export default async (ctx) => {
    const type = ctx.req.param('type') === 'all' ? '' : ctx.req.param('type').toUpperCase();
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

            const desc = await cache.tryGet(pageUrl, async () => {
                let desc = await got({
                    method: 'get',
                    url: pageUrl,
                }).json();
                desc = desc.queryNoticeContent.GGNR;

                desc = desc.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"');
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

    ctx.set('data', {
        title: '浙江土地使用权挂牌公告',
        link: host,
        item: items,
    });
};
