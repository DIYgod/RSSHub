const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response_thread_config = await got({
        method: 'get',
        url: `http://lkong.cn/forum/index.php?mod=ajax&action=threadconfig_${id}`,
    });
    const threadConfig = response_thread_config.data;
    function* genPage(i) {
        for (let a = 0; a < i; a++) {
            yield a + 1;
        }
    }

    const thread_item = await Promise.all(
        [...genPage(threadConfig.replies / 20)].map(async (page) => {
            const thread_page_url = `http://lkong.cn/forum/index.php?mod=data&sars=thread/${id}/${page}`;
            let thread_page;

            const cache = await ctx.cache.get(thread_page_url);
            if (cache) {
                thread_page = JSON.parse(cache);
            } else {
                const response = await got({
                    method: 'get',
                    url: `http://lkong.cn/forum/index.php?mod=data&sars=thread/${id}/${page}`,
                });
                thread_page = response.data;
                ctx.cache.set(thread_page_url, JSON.stringify(thread_page));
            }

            const new_item = thread_page.data.map((i) => ({
                title: `${i.lou}楼`,
                pubDate: new Date(i.dateline + ' +8').toUTCString(),
                author: i.author,
                description: i.message,
                link: `http://lkong.cn/thread/${id}/${page}.p_${i.pid}`,
            }));
            return new_item;
        })
    );

    const thread_items = [];
    thread_item.forEach((page_item) => {
        page_item.forEach((item) => {
            thread_items.push(item);
        });
    });
    ctx.state.data = {
        title: `龙空 ${threadConfig.forumname} ${threadConfig.subject}`,
        link: `http://lkong.cn/thread/${id}`,
        item: thread_items,
    };
};
