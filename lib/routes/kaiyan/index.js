const got = require('@/utils/got');

module.exports = async (ctx) => {
    const api_url = `https://baobab.kaiyanapp.com/api/v5/index/tab/allRec`;
    const response = await got({
        method: 'get',
        url: api_url,
    });
    // ## 获取列表
    const list = response.data.itemList[0].data.itemList;
    // ## 定义输出的item
    const out = await Promise.all(
        // ### 遍历列表，筛选出自己想要的内容
        list.map(async (item) => {
            if (item.type === 'followCard') {
                // #### 截取Json中需要的部分，便于下方变量快速取值
                const content = item.data.content;
                // #### 得到需要的RSS信息
                const title = content.data.title; // 标题
                const date = item.data.header.time; // 发布日期
                const videoUrl = content.data.playUrl; // 原装视频链接
                const itemUrl = `<video src="${content.data.playUrl}" controls="controls"></video>`; // 视频链接
                const imgUrl = `<img src="${content.data.cover.feed}" />`; // 图片链接
                const author = content.data.author.name; // 作者
                const description = content.data.description + '<br/>' + imgUrl + '<br/>' + itemUrl; // 拼接出详情，包括文字描述、封面图、视频链接

                const cache = await ctx.cache.get(itemUrl); // ### 得到全局中的缓存信息
                // ### 判断缓存是否存在，如果存在即跳过此次获取的信息
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }
                // ### 设置 RSS feed item
                const single = {
                    title,
                    link: videoUrl,
                    author,
                    description,
                    pubDate: new Date(date).toUTCString(),
                };
                // ### 设置缓存
                ctx.cache.set(itemUrl, JSON.stringify(single));
                return Promise.resolve(single);
            }
        })
    );

    ctx.state.data = {
        title: `开眼精选`,
        link: 'https://www.kaiyanapp.com/',
        description: '开眼每日精选',
        item: out,
    };
};
