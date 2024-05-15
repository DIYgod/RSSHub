const got = require('@/utils/got');

module.exports = async (ctx) => {
    const forum_id = ctx.params.forum_id || null;
    const topic_id = ctx.params.topic_id || null;
    const user_id = ctx.params.user_id || null;

    const query = ['initial_post=1', `order_by=create_time`];

    let link = 'https://forums.liyuans.com/recent';

    if (forum_id) {
        if (isNaN(forum_id)) {
            query.push(`forum_ids=${encodeURIComponent(forum_id)}`);
            link = `https://forums.liyuans.com`;
        } else {
            query.push(`forum_id=${encodeURIComponent(forum_id)}`);
            link = `https://forums.liyuans.com/forum/${forum_id}`;
        }
    }

    if (topic_id) {
        if (isNaN(topic_id)) {
            query.push(`topic_ids=${encodeURIComponent(topic_id)}`);
            link = `https://forums.liyuans.com`;
        } else {
            query.push(`topic_id=${encodeURIComponent(topic_id)}`);
            link = `https://forums.liyuans.com/topic/${topic_id}`;
        }
    }

    if (user_id) {
        if (isNaN(user_id)) {
            query.push(`user_ids=${encodeURIComponent(user_id)}`);
            link = `https://forums.liyuans.com`;
        } else {
            query.push(`user_id=${encodeURIComponent(user_id)}`);
            link = `https://forums.liyuans.com/user/${user_id}`;
        }
    }

    let qstr = '';
    if (query.length > 0) {
        qstr = '?' + query.join('&');
    }

    const response = await got({
        method: 'get',
        url: `https://api.forums.liyuans.com/threads${qstr}`,
    });

    const data = response.data.data.results;

    ctx.state.data = {
        title: '梨园',
        link,
        description: '最新帖子 - 梨园',
        allowEmpty: true,
        item: data.map((item) => {
            let category = [item.forum.name];
            if (item.topic) {
                category = category.push(item.topic.name);
            }

            return {
                title: item.title,
                author: item.user.nickname,
                category,
                description: `@${item.user.username}: ${item.initial_post.thumb}`,
                pubDate: new Date(item.create_time * 1000).toUTCString(),
                guid: `Thread_${item.id}`,
                link: `https://forums.liyuans.com/thread/${item.id}`,
            };
        }),
    };
};
