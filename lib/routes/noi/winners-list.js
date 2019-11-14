const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `http://www.noi.cn/GetNews.dt?cmd=list&place=8&psize=20`,
    });
    const result = await Promise.all(
        Object.keys(response.data).map(async (key) => {
            const item = response.data[key];
            if (item.id === undefined) {
                return true;
            }
            const title = (item.title + ' ' + item.title2).trim();
            const link = 'http://www.noi.cn/newsview.html?id=' + item.id + '&hash=' + item.hash;
            const guid = item.id + '_' + item.mtime;
            const pubDate = new Date(item.mtime).toUTCString();

            const single = {
                title: title,
                link: link,
                guid: guid,
                pubDate: pubDate,
                description: '',
            };

            const description_key = 'noi' + guid;
            const description_value = await ctx.cache.get(description_key);

            if (description_value) {
                single.description = description_value;
            } else {
                const url = 'http://www.noi.cn/GetNews.dt?cmd=read&newsid=' + item.id + '&hash=' + item.hash;
                const temp = await got({
                    method: 'get',
                    url: url,
                });
                single.description = temp.data.cont;
                ctx.cache.set(description_key, single.description);
            }

            return Promise.resolve(single);
        })
    );
    ctx.state.data = { title: '获奖名单 - NOI 全国青少年信息学奥林匹克竞赛', link: 'http://www.noi.cn/articles.html?type=8', item: result };
};
