const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response_thread_config = await got({
        method: 'get',
        url: `http://lkong.cn/forum/index.php?mod=ajax&action=threadconfig_${id}`,
    });
    const threadConfig = response_thread_config.data;
    const thread_item = [];
    let data = {};
    function* genPage(i) {
        while (true) {
            yield i++;
        }
    }

    for await (const page of genPage(1)) {
        const response = await got({
            method: 'get',
            url: `http://lkong.cn/forum/index.php?mod=data&sars=thread/${id}/${page}`,
        });

        if (typeof response.data.error !== 'undefined') {
            break;
        }

        data = response.data;
        for (let i = 0; i < data.data.length; i++) {
            thread_item.push({
                title: `${data.data[i].lou}楼`,
                pubDate: new Date(data.data[i].dateline + ' +8').toUTCString(),
                author: data.data[i].author,
                description: data.data[i].message,
                link: `http://lkong.cn/thread/${id}/${page}`,
            });
        }
    }

    ctx.state.data = {
        title: `龙空 ${threadConfig.forumname} ${threadConfig.subject}`,
        link: `http://lkong.cn/thread/${id}`,
        item: thread_item,
    };
};
