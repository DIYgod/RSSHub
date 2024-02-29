const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const type = ctx.params.type || 'discuss'; // short一句话  discuss
    const sort = ctx.params.sort || 'new'; // new最新  agree最有用

    const link = `https://www.nosetime.com/member/member_comment.php?id=${id}&type=${type}&o=${sort}`;

    const userinfo = await got({
        method: 'POST',
        url: 'https://www.nosetime.com/app/user.php',
        headers: {
            Referer: link,
            'Content-Type': 'application/json;charset=utf-8',
        },
        data: JSON.stringify({
            method: 'getsocialinfo',
            id,
        }),
    });

    const response = await got({
        method: 'POST',
        url: 'https://www.nosetime.com/app/user.php',
        headers: {
            Referer: link,
            'Content-Type': 'application/json;charset=utf-8',
        },
        data: JSON.stringify({
            method: `getweb${type}`,
            id,
            orderby: sort,
            page: 1,
        }),
    });

    const items = response.data.items.map((item) => ({
        title: `${'★★★★★☆☆☆☆☆'.slice(5 - item.score, 10 - item.score)} ${item.name}`,
        description: item.content,
        pubDate: new Date(item.time).toUTCString(),
        link: `https://www.nosetime.com/xiangshui/${item.id}-${item.iurl}.html`,
        author: userinfo.data.uname,
    }));

    ctx.state.data = {
        title: `香水时代 - ${userinfo.data.uname}`,
        link,
        description: userinfo.data.udesc,
        item: items,
    };
};
