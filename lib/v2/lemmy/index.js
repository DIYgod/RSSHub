const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const md = require('markdown-it')({ html: true });

module.exports = async (ctx) => {
    const sort = ctx.params.sort ?? 'Active';
    const community = ctx.params.community;
    const communitySlices = community.split('@');
    if (communitySlices.length !== 2) {
        throw new Error(`Invalid community: ${community}`);
    }
    const instance = community.split('@')[1];

    const communityUrl = `https://${instance}/api/v3/community?name=${community}`;
    const communityData = await ctx.cache.tryGet(communityUrl, async () => {
        const result = await got({ method: 'get', url: communityUrl, headers: { 'Content-Type': 'application/json' } });
        return result.data.community_view.community;
    });

    const postUrl = `https://${instance}/api/v3/post/list?type_=All&sort=${sort}&community_name=${community}&limit=50`;
    const postData = await ctx.cache.tryGet(postUrl, async () => {
        const result = await got({ method: 'get', url: postUrl, headers: { 'Content-Type': 'application/json' } });
        return result.data;
    });

    const items = postData.posts.map((e) => {
        const post = e.post;
        const creator = e.creator;
        const counts = e.counts;
        const item = {};
        item.guid = post.id;
        item.title = post.name;
        item.author = creator.name;
        item.pubDate = parseDate(post.published);
        item.link = post.ap_id;
        const url = post.url;
        const urlContent = url ? `<p><a href="${url}">${url}</a></p>` : '';
        const body = post.body ? md.render(post.body) : '';
        item.description = urlContent + body;
        item.comments = counts.comments;
        item.upvotes = counts.upvotes;
        item.downvotes = counts.downvotes;
        return item;
    });

    ctx.state.data = {
        title: `${community} - ${sort} posts`,
        description: communityData.description,
        link: communityData.actor_id,
        item: items,
    };
};
