const got = require('@/utils/got');
const config = require('@/config').value;

module.exports = async (ctx) => {
    if (!config.disqus || !config.disqus.api_key) {
        throw new Error('Disqus RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }
    const forum = ctx.params.forum;

    const response = await got({
        method: 'get',
        url: `https://disqus.com/api/3.0/forums/listPosts.json?api_key=${config.disqus.api_key}&forum=${forum}`,
        headers: {
            Referer: 'https://disqus.com/',
        },
    });

    const data = response.data.response;

    const threadsObj = {};
    for (const item of data) {
        threadsObj[item.thread] = 1;
    }
    let threadsQuery = '';
    for (const item of Object.keys(threadsObj)) {
        threadsQuery += `&thread=${item}`;
    }

    const responseThreads = await got({
        method: 'get',
        url: `https://disqus.com/api/3.0/forums/listThreads.json?api_key=${config.disqus.api_key}&forum=${forum}${threadsQuery}`,
        headers: {
            Referer: 'https://disqus.com/',
        },
    });

    const threads = responseThreads.data.response;

    ctx.state.data = {
        title: `${forum} 的评论`,
        link: `https://disqus.com/home/forums/${forum}`,
        description: `${forum} 的 disqus 评论`,
        item: data.map((item) => {
            const thread = threads.find((i) => i.id === item.thread);
            return {
                title: `${item.author.name}: ${item.raw_message}`,
                description: `${item.author.name} 在《${thread.clean_title}》中发表评论: ${item.message}`,
                pubDate: new Date(item.createdAt).toUTCString(),
                link: `${thread.link}/#comment-${item.id}`,
            };
        }),
    };
};
