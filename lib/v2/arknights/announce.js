const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { platform = 'Android', group = 'ALL' } = ctx.params;

    let {
        data: { announceList },
    } = await got({
        method: 'get',
        url: `https://ak-conf.hypergryph.com/config/prod/announce_meta/${platform}/announcement.meta.json`,
    });

    if (group !== 'ALL') {
        announceList = announceList.filter((item) => item.group === group);
    }

    announceList = await Promise.all(
        announceList.map((item) =>
            ctx.cache.tryGet(item.webUrl, async () => {
                const { data } = await got({
                    method: 'get',
                    url: item.webUrl,
                });

                const $ = cheerio.load(data);
                let description =
                    // 一般来讲是有字的
                    $('.content').html() ??
                    // 有些情况只有一张图
                    $('.banner-image-container.cover').html() ??
                    // 有些情况啥都没有（暂时没有遇到）
                    'No Description';

                // 游戏内部跳转链接
                description = description.replace(/href="uniwebview:\/\/.+?"/, 'href="#"');

                return {
                    title: item.title,
                    description,
                    // 不知道是哪一年的，所以不管了
                    pubDate: parseDate(`${item.month}-${item.day}`, 'M-D'),
                    link: item.webUrl,
                };
            })
        )
    );

    ctx.state.data = {
        title: `《明日方舟》${group === 'SYSTEM' ? '系统' : group === 'ACTIVITY' ? '活动' : '全部'}公告`,
        link: 'https://ak.hypergryph.com/',
        item: announceList,
    };
};
