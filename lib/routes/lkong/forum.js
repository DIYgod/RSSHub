const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const type_path = ctx.params.digest ? '/digest' : '';
    const type_name = ctx.params.digest ? ' 精华' : '';

    const response = await got({
        method: 'get',
        url: `http://lkong.cn/forum/index.php?mod=ajax&action=forumconfig_${id}`,
    });
    const forumconfig = response.data;

    const response_forum_item = await got({
        method: 'get',
        url: `http://lkong.cn/forum/index.php?mod=data&sars=forum/${id}${type_path}`,
    });

    const data = response_forum_item.data;

    const items = await Promise.all(
        data.data.map(async (i) => {
            const item = {
                title: i.subject,
                pubDate: new Date(i.dateline + ' +8').toUTCString(),
            };
            if (i.id.startsWith('thread_')) {
                const thread_id = i.id.substr('thread_'.length);

                const thread_list_url = `http://lkong.cn/thread/index.php?mod=data&sars=thread/${thread_id}`;
                const thread_config_url = `http://lkong.cn/forum/index.php?mod=ajax&action=threadconfig_${thread_id}`;
                let thread_list;
                let thread_config;

                const cache = await ctx.cache.get(thread_list_url);
                if (cache) {
                    thread_list = JSON.parse(cache);
                } else {
                    const response_thread_list = await got({
                        method: 'get',
                        url: thread_list_url,
                    });
                    thread_list = response_thread_list.data;
                    ctx.cache.set(thread_list_url, JSON.stringify(thread_list));
                }

                const cache1 = await ctx.cache.get(thread_config_url);
                if (cache1) {
                    thread_config = JSON.parse(cache1);
                } else {
                    const response_thread_config = await got({
                        method: 'get',
                        url: thread_config_url,
                    });
                    thread_config = response_thread_config.data;
                    ctx.cache.set(thread_config_url, JSON.stringify(thread_config));
                }

                item.link = `http://lkong.cn/thread/${thread_id}`;
                item.description = thread_list.data[0].message;
                item.title = thread_config.subject;
            }

            return item;
        })
    );

    ctx.state.data = {
        title: `龙空 ${forumconfig.name}${type_name}`,
        link: `http://lkong.cn/forum/${id}${type_path}`,
        description: forumconfig.blackboard,
        image: `http://img.lkong.cn/forumavatar/000/00/00/${id}_avatar_middle.jpg`,
        item: items,
    };
};
