const axios = require('@/utils/axios');
const cheerio = require('cheerio');

const getCacheParsed = async (ctx, key) => {
    const value = await ctx.cache.get(key);
    if (value) {
        return JSON.parse(value);
    }
};

const generateResponse = async (ctx, items) => ({
    // 源标题
    title: 'AlgoCasts',
    // 源链接
    link: `https://www.algocasts.com`,
    // 源说明
    description: `AlgoCasts 旨在用心做好每一个算法讲解视频。每个视频包含两个部分：题目的剖析讲解以及编码，力求在讲解清楚到位的基础上，尽可能地保持视频精简短小，让大家可以在碎片时间里进行学习，并收获这些算法题背后的思想与乐趣。`,
    item: await Promise.all(
        items.map(async (item) => ({
            // 文章标题
            title: `${item.title} | AlgoCasts 视频更新`,
            // 文章正文
            description: item.description || '',
            // 文章链接
            link: item.link,
        }))
    ),
});

const makeFull = async (ctx, infos) => {
    const limit = 10; // 仅获取最近十条信息（避免无意义请求）
    infos = infos.slice(0, limit);

    return await Promise.all(
        infos.map(async (item) => {
            const cacheKey = `episode-${item.episode}`;

            // 尝试从缓存查找相关数据
            let info = await getCacheParsed(ctx, cacheKey);
            // console.log(info);
            if (info) {
                // 找到 -> 直接返回
                return info;
            } else {
                // 未找到 -> 返回
                info = item;
            }
            // 抓取详细信息
            const response = await axios({
                method: 'get',
                url: info.link,
            });
            const $ = cheerio.load(response.data);

            const badges = [];
            $('.badge').each((index, badge) => {
                badges.push($(badge).text());
            });

            info.description = `<h1>${info.title}</h1><div>${badges.join(' | ')}</div><div>${$('#my-content p').html()}</div>`;
            ctx.cache.set(cacheKey, info);

            // console.log(info);

            return info;
        })
    );
};

module.exports = async (ctx) => {
    const full = Boolean(ctx.params.full || false);

    // 查询上次更新的时间
    const lastRefreshTime = await getCacheParsed(ctx, 'last-refresh-time');

    if (lastRefreshTime && new Date(lastRefreshTime) - new Date() > 10 * 60 * 1000) {
        // 上次检查列表不足 10min -> 直接返回
        if (full) {
            ctx.state.data = await generateResponse(ctx, await makeFull(ctx, await getCacheParsed(ctx, 'last-result')));
        } else {
            ctx.state.data = await generateResponse(ctx, await getCacheParsed(ctx, 'last-result'));
        }
        return;
    }
    // 上次检查列表大于 10min -> 重新请求列表
    const response = await axios({
        method: 'get',
        url: 'http://algocasts.io/episodes',
    });

    const $ = cheerio.load(response.data);
    const infos = [];

    $('tr')
        .slice(1)
        .each((i, e) => {
            const id = parseInt(
                $(e)
                    .find('th')
                    .text()
            );
            const titleLabel = $(e).find('td a');
            const title = `${id}. ${titleLabel.text()}`;
            const episode = titleLabel
                .attr('href')
                .trim()
                .split('/')[2];
            const link = `http://algocasts.io/episodes/${episode}`;

            infos.push({ id, title, episode, link });
        });

    ctx.cache.set(`last-result`, infos);
    ctx.cache.set(`last-refresh-time`, new Date());

    if (full) {
        ctx.state.data = await generateResponse(ctx, await makeFull(ctx, infos));
    } else {
        ctx.state.data = await generateResponse(ctx, infos);
    }
};
