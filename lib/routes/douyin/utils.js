const formatItem = (item) => {
    const formatVideoUrl = (url) => url.replace('/play/', '/playwm/');
    const appLink = `https://www.amemv.com/redirect/?redirect_url=snssdk1128%3A%2F%2Faweme%2Fdetail%2F${item.aweme_id}%3Frefer%3Dweb%26gd_label%3Dclick_wap_profile_feature%26appParam%3D%26needlaunchlog%3D1`;
    let content = '';
    let link = '';
    let guid = '';

    switch (item.aweme_type) {
        case 2:
            // 图片
            content = item.image_infos.reduce((acc, item) => {
                const imgUrl = item.label_large.url_list[0].replace('.webp', '.png');
                acc += `
                    <img referrerpolicy="no-referrer" src="${imgUrl}"><br>
                `;
                return acc;
            }, '');
            link = guid = appLink;
            break;

        case 4:
            // 视频
            /* eslint-disable no-case-declarations */
            const originVideoUrl = item.video.play_addr.url_list[0];
            const formatedVideoUrl = formatVideoUrl(originVideoUrl);
            content = `
                <video
                    controls="controls"
                    width="${item.video.width}"
                    height="${item.video.height}"
                    poster="${item.video.cover.url_list[0]}"
                    src="${formatedVideoUrl}"
                >
            `;
            link = formatedVideoUrl;
            guid = originVideoUrl;
            break;

        default:
            content = '未知类型，请点击<a href="https://github.com/DIYgod/RSSHub/issues">链接</a>提交issue';
            link = guid = appLink;
    }

    return {
        title: item.desc,
        description: `
    <p>${item.desc}</p>
    <p><a href="${appLink}">APP 内打开</a></p>
    <p>
        ${content}
    </p>`,
        link,
        guid,
    };
};

module.exports = {
    formatItem,
};
