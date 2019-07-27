const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got({
        method: 'get',
        url: `http://lkong.cn/forum/index.php?mod=ajax&action=forumconfig_${id}`,
    });
    const forumconfig = response.data;

    const response_forum_item = await got({
        method: 'get',
        url: `http://lkong.cn/forum/index.php?mod=data&sars=forum/${id}`,
    });

    const data = response_forum_item.data;

    const forum_item = [];
    for await (const i of data.data) {
        const item = {
            title: i.subject,
            pubDate: new Date(i.dateline + ' +8').toUTCString(),
        };

        if (i.id.startsWith('thread_')) {
            const thread_id = i.id.substr('thread_'.length);
            item.link = `http://lkong.cn/thread/${thread_id}`;
            const response_thread_list = await got({
                method: 'get',
                url: `http://lkong.cn/thread/index.php?mod=data&sars=thread/${thread_id}`,
            });
            const threadList = response_thread_list.data;
            item.description = threadList.data[0].message;

            const response_thread_config = await got({
                method: 'get',
                url: `http://lkong.cn/forum/index.php?mod=ajax&action=threadconfig_${thread_id}`,
            });
            const threadConfig = response_thread_config.data;

            item.title = threadConfig.subject;
        }

        forum_item.push(item);
    }

    ctx.state.data = {
        title: `龙空 ${forumconfig.name}`,
        link: `http://lkong.cn/forum/${id}`,
        description: forumconfig.blackboard,
        image: `http://img.lkong.cn/forumavatar/000/00/00/${id}_avatar_middle.jpg`,
        item: forum_item,
    };
};
