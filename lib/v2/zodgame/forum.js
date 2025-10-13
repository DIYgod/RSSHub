const got = require('@/utils/got');
const config = require('@/config').value;
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const rootUrl = 'https://zodgame.xyz';

module.exports = async (ctx) => {
    const fid = ctx.params.fid;
    const subUrl = `${rootUrl}/api/mobile/index.php?version=4&module=forumdisplay&fid=${fid}`;
    const cookie = config.zodgame.cookie;

    if (cookie === undefined) {
        throw Error('Zodgame RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }

    const response = await got({
        method: 'get',
        url: subUrl,
        headers: {
            Cookie: cookie,
        },
    });

    const info = response.data.Variables;

    const ThreadList = info.forum_threadlist
        .map((item) => {
            if (!info.threadtypes.types[item.typeid]) {
                return undefined;
            }
            const type = info.threadtypes.types[item.typeid];

            return {
                tid: item.tid,
                title: `[${type}] ${item.subject}`,
                author: item.author,
                link: `${rootUrl}/forum.php?mod=viewthread&tid=${item.tid}&extra=page%3D1`,
                category: type,
                pubDate: parseDate(item.dbdateline * 1000),
            };
        })
        .filter((item) => item !== undefined);

    // fulltext
    const items = await Promise.all(
        ThreadList.map((item) =>
            ctx.cache.tryGet(item.tid, async () => {
                const threadResponse = await got({
                    method: 'get',
                    url: `${rootUrl}/api/mobile/index.php?version=4&module=viewthread&tid=${item.tid}`,
                    headers: {
                        Cookie: cookie,
                    },
                });

                const threadInfo = threadResponse.data.Variables;

                let description = '';

                if (threadInfo.thread.freemessage) {
                    description += threadInfo.thread.freemessage;
                    description += art(path.join(__dirname, 'templates/forum.art'), {
                        content: threadInfo.postlist[0].message,
                    });
                } else {
                    description += threadInfo.postlist[0].message;
                }

                return {
                    title: item.title,
                    author: item.author,
                    link: item.link,
                    description,
                    category: item.category,
                    pubDate: item.pubDate,
                    guid: item.tid,
                    upvotes: parseInt(threadInfo.thread.recommend_add, 10),
                    downvotes: parseInt(threadInfo.thread.recommend_sub, 10),
                    comments: parseInt(threadInfo.thread.replies, 10),
                };
            })
        )
    );

    ctx.state.data = {
        title: `${info.forum.name} - ZodGame论坛`,
        link: `${rootUrl}/forum.php?mod=forumdisplay&fid=${fid}`,
        item: items,
    };
};
