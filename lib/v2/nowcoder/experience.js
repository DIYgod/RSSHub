const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const host = 'https://www.nowcoder.com';

module.exports = async (ctx) => {
    const params = new URLSearchParams(ctx.query);
    params.append('tagId', ctx.params.tagId);

    const link = new URL('/discuss/experience/json', host);

    // const link = `https://www.nowcoder.com/discuss/experience/json?tagId=${tagId}&order=${order}&companyId=${companyId}&phaseId=${phaseId}`;
    link.search = params;
    const response = await got.get(link.toString());
    const data = response.data.data;

    const list = data.discussPosts.map((x) => {
        const info = {
            title: x.postTitle,
            link: new URL('discuss/' + x.postId, host).href,
            author: x.author,
            pubDate: timezone(parseDate(x.createTime), +8),
            category: x.postTypeName,
        };
        return info;
    });

    const out = await Promise.all(
        list.map((info) =>
            ctx.cache.tryGet(info.link, async () => {
                const response = await got.get(info.link);
                const $ = cheerio.load(response.data);

                info.description = $('.nc-post-content').html();

                return info;
            })
        )
    );

    ctx.state.data = {
        title: `牛客面经Tag${ctx.params.tagId}`,
        link: link.href,
        item: out,
    };
};
