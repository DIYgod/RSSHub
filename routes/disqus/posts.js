const axios = require('axios');
const template = require('../../utils/template');
const config = require('../../config');

module.exports = async (ctx) => {
    const forum = ctx.params.forum;

    const response = await axios({
        method: 'get',
        url: `https://disqus.com/api/3.0/forums/listPosts.json?api_key=${config.disqus.api_key}&forum=${forum}`,
        headers: {
            'User-Agent': config.ua,
            'Referer': 'https://disqus.com/'
        }
    });

    const data = response.data.response;

    const threadsObj = {};
    data.forEach((item) => {
        threadsObj[item.thread] = 1;
    });
    let threadsQuery = '';
    Object.keys(threadsObj).forEach((item) => {
        threadsQuery += `&thread=${item}`;
    });

    const responseThreads = await axios({
        method: 'get',
        url: `https://disqus.com/api/3.0/forums/listThreads.json?api_key=${config.disqus.api_key}&forum=${forum}${threadsQuery}`,
        headers: {
            'User-Agent': config.ua,
            'Referer': 'https://disqus.com/'
        }
    });

    const threads = responseThreads.data.response;

    ctx.body = template({
        title: `${forum} 的评论`,
        link: `https://disqus.com/home/forums/${forum}`,
        description: `${forum} 的 disqus 评论`,
        item: data.map((item) => {
            const thread = threads.filter((i) => i.id === item.thread)[0];
            return {
                title: `${item.author.name}: ${item.raw_message > 24 ? item.raw_message.slice(0, 24) + '...' : item.raw_message}`,
                description: `${item.author.name} 在《${thread.clean_title}》中发表评论: ${item.message}`,
                pubDate: new Date(item.createdAt).toUTCString(),
                link: `${thread.link}/#comment-${item.id}`
            };
        }),
    });
};