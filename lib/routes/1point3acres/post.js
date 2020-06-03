const got = require('@/utils/got');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    let url;
    let method;
    let description;
    let { title } = 'null';
    // eslint-disable-next-line eqeqeq
    if (title == 'null') {
        method = 'get';
    }
    // eslint-disable-next-line eqeqeq
    category == 'new'
        ? ((url = 'https://api.1point3acres.com/api/threads?type=new&pg=1&ps=20&includes=last_reply'), (title = '最新帖子'))
        : ((url = 'https://api.1point3acres.com/api/threads?type=hot&pg=1&ps=20&includes=last_reply'), (title = '最热帖子'));
    const responseBasic = await got({
        method: method,
        url: url,
    });
    const data = responseBasic.data.threads;
    ctx.state.data = {
        title: `${title} - 一亩三分地`,
        link: `https://www.1point3acres.com/bbs/`,
        description: `${title} - 一亩三分地`,
        item: data.map((item) => {
            // eslint-disable-next-line eqeqeq
            item.last_reply.quote == '' ? (description = item.last_reply.message_bbcode) : (description = item.last_reply.quote);
            return {
                title: `${item.subject}`,
                // description: item.last_reply.message_bbcode,// + `<b>楼主:</b>` + item.author,
                description: description,
                // pubDate: new Date(item.submittime + ' GMT+8').toUTCString(),
                link: `https://instant.1point3acres.com/thread/${item.tid}`,
            };
        }),
    };
};
