const got = require('@/utils/got');
const weiboUtils = require('./utils');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;

    const containerResponse = await got({
        method: 'get',
        url: `https://m.weibo.cn/api/container/getIndex?type=uid&value=${uid}`,
        headers: {
            Referer: 'https://m.weibo.cn/',
        },
    });
    const name = containerResponse.data.data.userInfo.screen_name;
    const description = containerResponse.data.data.userInfo.description;
    const profileImageUrl = containerResponse.data.data.userInfo.profile_image_url;
    const containerid = containerResponse.data.data.tabsInfo.tabs[1].containerid;

    const response = await got({
        method: 'get',
        url: `https://m.weibo.cn/api/container/getIndex?type=uid&value=${uid}&containerid=${containerid}`,
        headers: {
            Referer: `https://m.weibo.cn/u/${uid}`,
            'MWeibo-Pwa': 1,
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
        },
    });

    const resultItem = await Promise.all(
        response.data.data.cards
            .filter((item) => item.mblog && !item.mblog.isTop)
            .map(async (item) => {
                let data = {};
                const key = 'weibo:user:' + item.mblog.bid;
                const value = await ctx.cache.get(key);
                if (value) {
                    data = JSON.parse(value);
                } else {
                    // 可以判断出是否是长微博，如果不是那么不调下边的接口获取完整全文也行，但是拿不到准确的created_at，而是“几小时前”这种
                    // 索性就都再调接口获取详细data了，这个接口只返回json所以性能消耗不大。另外做了缓存处理
                    const link = `https://m.weibo.cn/statuses/show?id=${item.mblog.bid}`;
                    const itemResponse = await got.get(link, {
                        headers: {
                            Referer: `https://m.weibo.cn/u/${uid}`,
                            'MWeibo-Pwa': 1,
                            'X-Requested-With': 'XMLHttpRequest',
                            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
                        },
                    });
                    data = itemResponse.data.data;
                    ctx.cache.set(key, JSON.stringify(data));
                }

                // 是否通过api拿到了data
                const isDataOK = data !== undefined && data.text;
                if (isDataOK) {
                    item.mblog.text = data.text;
                }
                const description = weiboUtils.format(item.mblog);
                const title = description.replace(/<img.*?>/g, '[图片]').replace(/<.*?>/g, '');
                const pubDate = isDataOK ? new Date(data.created_at).toUTCString() : date(item.mblog.created_at, 8);

                const it = {
                    title: title,
                    description: description,
                    link: `https://weibo.com/${uid}/${item.mblog.bid}`,
                    pubDate: pubDate,
                };
                return Promise.resolve(it);
            })
    );

    ctx.state.data = {
        title: `${name}的微博`,
        link: `http://weibo.com/${uid}/`,
        description: description,
        image: profileImageUrl,
        item: resultItem,
    };
};
