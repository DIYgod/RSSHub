const got = require('../../utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got({
        method: 'get',
        url: `https://api.gotokeep.com/social/v3/people/${id}/home`,
        headers: {
            Referer: `https://show.gotokeep.com/users/${id}`,
        },
    });

    response.data.data.entries[0] = response.data.data.entries[0].entries;
    const data = response.data.data.entries.reduce((all, current) => all.concat(current.entries));

    ctx.state.data = {
        title: `${data[0].author.username} 的 Keep 动态`,
        link: `https://show.gotokeep.com/users/${id}`,
        language: 'zh-cn',
        item: data
            .filter((item) => 'title' in item.meta)
            .map((item) => {
                let images = [];
                if (item.images) {
                    images = item.meta.picture ? item.images.concat(item.meta.picture) : item.images;
                } else if (item.meta.picture) {
                    images = [item.meta.picture];
                }
                let imagesTpl = '';
                images.forEach((item) => {
                    imagesTpl += `<img src="${item}">`;
                });

                const minute = Math.floor(item.meta.secondDuration / 60);
                const second = item.meta.secondDuration - minute * 60;
                return {
                    title: item.meta.title.trim(),
                    pubDate: item.created,
                    link: `https://show.gotokeep.com/entries/${item.id}`,
                    description: `项目：${item.meta.name === item.meta.workoutName ? item.meta.name : `${item.meta.name} - ${item.meta.workoutName}`}<br>时长：${minute}分${second}秒${item.content ? `<br>备注：${item.content}` : ''}${
                        imagesTpl ? `<br>${imagesTpl}` : ''
                    }`,
                };
            }),
    };
};
