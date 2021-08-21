const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const api_data = await got.get('https://prod-u.ishuhui.com/ver');
    const comics_code = api_data.data.data.comics;

    let lastEpisodeId;
    const rssData = await got({
        method: 'get',
        url: `https://prod-api.ishuhui.com/ver/${comics_code}/anime/detail?id=${id}&type=comics&.json`,
        headers: {
            Origin: 'https://www.ishuhui.com',
            Referer: `https://www.ishuhui.com/comics/anime/${id}`,
        },
    }).then((response) => {
        // 漫画名
        const name = response.data.data.name;
        // 漫画描述
        const desc = response.data.data.desc;

        const episodeGroup = response.data.data.comicsIndexes['1'].nums;
        let lastGroup = '0';
        for (const key in episodeGroup) {
            if (parseInt(lastGroup.split('-')[0]) < parseInt(key.split('-')[0])) {
                lastGroup = key;
            }
        }

        // 找到最新章节组
        let lastEpisode = '-1';
        for (const group in episodeGroup[lastGroup]) {
            if (parseInt(lastEpisode) < parseInt(group)) {
                lastEpisode = group;
            }
        }

        // 最新章节id
        lastEpisodeId = episodeGroup[lastGroup][lastEpisode][0].id;

        return {
            name,
            desc,
        };
    });

    let description = '';
    const data = await got({
        method: 'get',
        url: `https://prod-api.ishuhui.com/comics/detail?id=${lastEpisodeId}`,
        headers: {
            Origin: 'https://www.ishuhui.com',
            Referer: `https://www.ishuhui.com/comics/detail/${lastEpisodeId}`,
        },
    }).then((response) => {
        const picUrlArray = response.data.data.contentImg;
        const rssTitle = response.data.data.animeName;
        const title = response.data.data.title;
        const index = response.data.data.numberEnd;
        const updateTime = response.data.data.updateTime;
        for (let i = 0; i < picUrlArray.length; i++) {
            description += `<img src="${picUrlArray[i].url}"><br>`;
        }

        const item = {
            rssTitle,
            title,
            description,
            index,
            updateTime,
        };
        return [item];
    });

    ctx.state.data = {
        // 源标题
        title: `${rssData.name}`,
        // 源链接
        link: `https://www.ishuhui.com/comics/anime/${id}`,
        // 源说明
        description: `${rssData.desc}`,
        // 遍历此前获取的数据
        item: data.map((item) => ({
            // 文章标题
            title: `第${item.index}话-${item.title}`,
            // 文章正文
            description: item.description,
            // 文章发布时间
            pubDate: new Date(item.updateTime).toUTCString(),
            // 文章链接
            link: `http://www.hanhuazu.cc/comics/detail/${lastEpisodeId}`,
        })),
    };
};
