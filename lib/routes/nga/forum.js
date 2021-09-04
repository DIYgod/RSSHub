const got = require('@/utils/got');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const { fid, recommend } = ctx.params;
    const timestamp = Math.floor(Date.now() / 1000);
    let cookieString = `guestJs=${timestamp};`;
    if (config.nga.uid && config.nga.cid) {
        cookieString = `ngaPassportUid=${config.nga.uid}; ngaPassportCid=${config.nga.cid};`;
    }
    const formatContent = (content) =>
        content
            .replace(/\[img\](.+?)\[\/img\]/g, (match, p1) => {
                const src = p1.replace(/\?.*/g, '');
                return `<img src="${src}" />`;
            })
            .replace(/\[url\](.+?)\[\/url\]/g, `<a href="$1">$1</a>`);
    const homePage = await got({
        method: 'post',
        url: 'https://ngabbs.com/app_api.php?__lib=subject&__act=list',
        headers: {
            'X-User-Agent': 'NGA_skull/6.0.5(iPhone10,3;iOS 12.0.1)',
            Cookie: cookieString,
        },
        form: {
            fid,
            recommend: recommend ? 1 : 0,
        },
    });

    const forumname = homePage.data.forumname;

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
                const response = await got({
                    method: 'post',
                    url: 'https://ngabbs.com/app_api.php?__lib=post&__act=list',
                    headers: {
                        'X-User-Agent': 'NGA_skull/6.0.5(iPhone10,3;iOS 12.0.1)',
                        Cookie: cookieString,
                    },
                    form: {
                        tid,
                    },
                });

                return response.data.code === 0 ? formatContent(response.data.result[0].content) : response.data.msg;
            });

            item.description = description;
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: `NGA-${forumname}${recommend ? '-精华' : ''}`,
        link: `https://nga.178.com/thread.php?fid=${fid}`,
        description: 'NGA是国内专业的游戏玩家社区,魔兽世界,英雄联盟,炉石传说,风暴英雄,暗黑破坏神3(D3)游戏攻略讨论,以及其他热门游戏玩家社区',
        item: resultItem,
    };
};
