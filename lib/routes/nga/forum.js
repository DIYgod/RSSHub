const axios = require('../../utils/axios');
const qs = require('querystring');

module.exports = async (ctx) => {
    const { fid } = ctx.params;
    const axiosInstance = axios.create({
        baseURL: 'https://ngabbs.com/app_api.php',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-User-Agent': 'NGA_skull/6.0.5(iPhone10,3;iOS 12.0.1)',
        },
    });
    const homePage = await axiosInstance.request({
        method: 'post',
        url: '?__lib=subject&__act=list',
        data: qs.stringify({
            fid,
        }),
    });

    const list = homePage.data.result.data.filter(({ tid }) => tid);

    const resultItem = await Promise.all(
        list.map(async ({ subject, postdate, tid }) => {
            const link = `https://nga.178.com/read.php?tid=${tid}`;
            const item = {
                title: subject,
                description: '',
                link,
                pubDate: new Date(postdate * 1000).toUTCString(),
            };

            const description = await ctx.cache.tryGet(`nga-forum: ${link}`, async () => {
                const response = await axiosInstance.request({
                    method: 'post',
                    url: '?__lib=post&__act=list',
                    data: qs.stringify({
                        tid,
                    }),
                });

                return response.data.result[0].content;
            });

            item.description = description;
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: `NGA-${fid}`,
        link: `https://nga.178.com/thread.php?fid=${fid}`,
        description: 'NGA是国内专业的游戏玩家社区,魔兽世界,英雄联盟,炉石传说,风暴英雄,暗黑破坏神3(D3)游戏攻略讨论,以及其他热门游戏玩家社区',
        item: resultItem,
    };
};
