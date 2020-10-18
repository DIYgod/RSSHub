const got = require('@/utils/got');

function getContentByActivity(item, isRenderingRepost = false) {
    const { status, comments } = item;
    let description = '';
    let title = '';

    let usernameAndAvatar = `<a href="${status.author.url}">`;
    if (!isRenderingRepost) {
        usernameAndAvatar += `<img align="left" width="48" src="${status.author.avatar}" hspace="8" vspace="8" />`;
    }
    usernameAndAvatar += `<strong>${status.author.name}</strong></a>&nbsp;&nbsp;`;

    title += `${status.author.name} ${status.activity}: `;
    description += usernameAndAvatar + `${status.activity}`;

    description += `<br><small>${status.create_time}</small><br>`;

    let text = status.text;
    let lastIndex = 0;
    const replacedTextSegements = [];
    for (const entity of status.entities) {
        replacedTextSegements.push(text.slice(lastIndex, entity.start));
        replacedTextSegements.push(`<a href="${entity.uri.replace('douban://douban.com', 'https://www.douban.com/doubanapp/dispatch?uri=')}" target="_blank" rel="noopener noreferrer">${entity.title}</a>`);
        lastIndex = entity.end;
    }
    replacedTextSegements.push(text.slice(lastIndex));
    text = replacedTextSegements.join('');

    // text // images // video_info // parent status

    description += text;

    if (status.card) {
        if (status.card.rating) {
            title += `《${status.card.title}》`;
        } else {
            title += `「${status.card.title}」`;
        }
    }

    title += status.text.replace('\n', '');

    if (status.images.length) {
        description += `<br clear="both" /><div style="clear: both"></div>`;
        status.images.forEach((image) => {
            description += '<a href="' + image.large.url + '"><img vspace="8" hspace="4" src="' + image.large.url + '"></a>';
        });
    }

    if (status.video_info) {
        description += `<br clear="both" /><div style="clear: both"></div>`;
        const videoCover = status.video_info.cover_url;
        const videoSrc = status.video_info.video_url;
        description += `${videoSrc ? `<video src="${videoSrc}" ${videoCover ? `poster="${videoCover}"` : ''}></video>` : ''}`;
    }

    if (status.parent_status) {
        description += ' 🔁 ';
        title += ' 🔁 ';

        let usernameAndAvatar = `<a href="${status.parent_status.author.url}">`;
        usernameAndAvatar += `<strong>${status.parent_status.author.name}</strong></a>:&nbsp;&nbsp;`;
        description += usernameAndAvatar + status.parent_status.text;
        title += usernameAndAvatar + status.parent_status.text;
    }

    // card
    if (status.card) {
        let image;
        if (status.card.image && (status.card.image.large || status.card.image.normal)) {
            image = status.card.image.large || status.card.image.normal;
        }

        description += `<br clear="both" /><div style="clear: both"></div><blockquote>`;
        if (image) {
            description += `<img height="${image.height}" src="${image.url}" vspace="8" hspace="4" align="left"  />`;
        }
        description += `<a href="${status.card.url}" target="_blank" rel="noopener noreferrer"><strong>${status.card.title}</strong><br><small>${status.card.subtitle}</small>`;
        if (status.card.rating) {
            description += `<br><small>评分：${status.card.rating}</small>`;
        }
        description += `</a><br clear="both" /><div style="clear: both"></div></blockquote>`;
    }

    // video_card
    if (status.video_card) {
        description += `<br clear="both" /><div style="clear: both"></div><blockquote>`;
        const videoCover = status.video_card.video_info && status.video_card.video_info.cover_url;
        const videoSrc = status.video_card.video_info && status.video_card.video_info.video_url;
        description += `${videoSrc ? `<video src="${videoSrc}" ${videoCover ? `poster="${videoCover}"` : ''}></video>` : ''}<br>${status.video_card.title ? `<a href="${status.video_card.url}">${status.video_card.title}</a>` : ''}`;
        description += `</blockquote>`;
    }

    // reshared_status
    if (status.reshared_status) {
        description += `<br clear="both" /><div style="clear: both"></div><blockquote>`;

        if (status.reshared_status.deleted) {
            description += `原动态已被发布者删除`;
            title += ` | 原动态已被发布者删除`;
        } else {
            description += getContentByActivity({ status: status.reshared_status, comments: [] }, true).description;
            title += ' | ' + status.reshared_status.text;
        }

        const reshared_url = status.reshared_status.uri.replace('douban://douban.com', 'https://www.douban.com/doubanapp/dispatch?uri=');

        description += `<br><small>原动态：<a href="${reshared_url}" target="_blank" rel="noopener noreferrer">${reshared_url}</a></small><br clear="both" /><div style="clear: both"></div></blockquote>`;
    }

    // comments
    if (!isRenderingRepost) {
        if (comments.length > 0) {
            description += '<hr>';
        }
        for (const comment of comments) {
            description += `<br>${comment.text} - <a href="${comment.author.url}" target="_blank" rel="noopener noreferrer">${comment.author.name}</a>`;
        }
    }

    description = description.trim().replace(/\n/g, '<br>');
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
                    const r = getContentByActivity(item);
                    return {
                        title: r.title,
                        link: item.status.sharing_url,
                        pubDate: new Date(Date.parse(item.status.create_time + ' GMT+0800')).toUTCString(),
                        description: r.description,
                    };
                }),
    };
};
