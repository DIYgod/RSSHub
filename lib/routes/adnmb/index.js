// a岛匿名版
const got = require('@/utils/got');
module.exports = async (ctx) => {
    const pid = ctx.params.pid;
    const page = ctx.params.page;
    const url = `https://adnmb2.com/Api/showf?id=${pid}&page=${page}`;
    const response = await got({
        method: 'get',
        url: url,
    });
    const data = response.data;

    const items = [];
    data.forEach((item) => {
        const newItems = { title: item.content, pubDate: '${item.now}', link: `https://adnmb2.com/t/${item.id}` };
        const img = item.img !== '' ? '<img src="https://nmbimg.fastmirror.org/thumb/' + item.img + item.ext + '"/>' : '';
        let replys = '';
        item.replys.forEach((reply) => {
            const replyImg = reply.img !== '' ? '<img src="https://nmbimg.fastmirror.org/thumb/' + reply.img + reply.ext + '"/>' : '';
            replys += `<h4>${reply.title} ${reply.name}  ${reply.now} ID:${reply.userid} No.${reply.id}</h4> </br>
                          ${reply.content}
                          ${replyImg}
                          <hr />
            `;
        });
        newItems.description = `<h2>${item.title} ${item.name}  ${item.now} ID:${item.userid} No.${item.id}</h2> </br>
                          ${item.content}
                           ${img}
                          <hr />
                          ${replys}
            `;
        items.push(newItems);
    });

    ctx.state.data = {
        // 源标题
        title: `a岛匿名版`,
        // 源链接
        link: `https://adnmb2.com/Forum`,
        // 源说明
        description: `A岛是一个前台匿名后台实名的论坛`,
        // 遍历此前获取的数据
        item: items,
    };
};
