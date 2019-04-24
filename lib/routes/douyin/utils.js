const formatVideoUrl = (url) => url.replace('/play/', '/playwm/');

const formatItem = (item) => {
    const originVideoUrl = item.video.play_addr.url_list[0];
    const formatedVideoUrl = formatVideoUrl(originVideoUrl);

    return {
        title: item.desc,
        description: `
    <p>${item.desc}</p>
    <p><a href="https://www.amemv.com/redirect/?redirect_url=aweme%3A%2F%2Faweme%2Fdetail%2F${item.aweme_id}%3Frefer%3Dweb%26gd_label%3Dclick_wap_profile_feature%26appParam%3D%26needlaunchlog%3D1">APP 内打开</a></p>
    <p>
        <video
          controls="controls"
          width="${item.video.width}"
          height="${item.video.height}"
          poster="${item.video.cover.url_list[0]}"
          src="${formatedVideoUrl}"
        >
    </p>`,
        link: formatedVideoUrl,
        guid: originVideoUrl,
    };
};

module.exports = {
    formatItem,
};
