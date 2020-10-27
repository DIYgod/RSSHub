const got = require('@/utils/got');

function getContentByActivity(status) {
    let description = '';
    let title = '';
    switch (status.activity) {
        case '说':
            title = `${status.author.name} ${status.activity}:${status.text}`;
            description = status.text;
            status.images.forEach((image) => {
                description += `<p><img src="${image.large.url}"/></p>`;
            });
            break;
        case '转发':
            description = `${status.text}<br>`;
            if (status.reshared_status.deleted) {
                title = `${status.author.name} ${status.activity} 广播：原动态已被发布者删除`;
                description += `原动态已被发布者删除`;
            } else {
                description += getContentByActivity(status.reshared_status).title;
                title = `${status.author.name} ${status.activity} ${status.reshared_status.author.name} 的广播：${status.reshared_status.text}`;
                status.reshared_status.images.forEach((image) => {
                    description += `<p><img src="${image.large.url}"/></p>`;
                });
            }

            break;
        default:
            description = `${status.text ? `${status.text}<br><br>` : ''}`;
            title = `${status.author.name}${status.activity}: ${description}`;
            if (status.card) {
                let image;
                if (status.card.image && (status.card.image.large || status.card.image.normal)) {
                    image = (status.card.image.large || status.card.image.normal).url;
                }
                if (status.card.rating) {
                    description += `豆瓣评分：${status.card.rating}<br>${status.card.subtitle}${image ? `<br><img src="${image}">` : ''}<br><a href="${status.card.url}">《${status.card.title}》</a>`;
                    title = `${status.author.name}${status.activity}:《${status.card.title}》`;
                } else {
                    description += `${status.card.subtitle}${image ? `<br><img src="${image}">` : ''}<br>${status.card.url ? `<a href="${status.card.url}">${status.card.title}</a>` : ''}`;
                    title = `${status.author.name} ${status.activity}:「${status.card.title}」${status.text}`;
                }
            }
            if (status.video_card) {
                const videoCover = status.video_card.video_info && status.video_card.video_info.cover_url;
                const videoSrc = status.video_card.video_info && status.video_card.video_info.video_url;
                description += `${videoSrc ? `<br><video src="${videoSrc}" ${videoCover ? `poster="${videoCover}"` : ''}></video>` : ''}<br><br>${
                    status.video_card.title ? `<a href="${status.video_card.url}">${status.video_card.title}</a>` : ''
                }`;
                title = `${status.author.name}${status.activity}:《${status.video_card.title}》`;
            }
            break;
    }
    return { title, description };
}

module.exports = async (ctx) => {
    const userid = ctx.params.userid;
    const url = `https://m.douban.com/rexxar/api/v2/status/user_timeline/${userid}?max_id=&ck=eUUA&for_mobile=1`;

    const response = await got({
        method: 'GET',
        url: url,
        headers: {
            Referer: `https://m.douban.com/people/${userid}/statuses`,
        },
    });

    const items = response.data.items;

    const username = items ? items[0].status.author.name : '';

    ctx.state.data = {
        title: `豆瓣广播 - ${username ? username : userid}`,
        link: `https://m.douban.com/people/${userid}/statuses`,
        item:
            items &&
            items
                .filter((item) => !item.deleted)
                .map((item) => {
                    const r = getContentByActivity(item.status);
                    return {
                        title: r.title,
                        link: item.status.sharing_url,
                        pubDate: new Date(Date.parse(item.status.create_time + ' GMT+0800')).toUTCString(),
                        description: r.description,
                    };
                }),
    };
};
