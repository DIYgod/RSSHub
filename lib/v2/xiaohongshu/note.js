// 导入所需模组
const got = require('@/utils/got'); // 自订的 got
const { parseDate } = require('@/utils/parse-date');
const config = require('@/config').value;
const cheerio = require('cheerio'); // 可以使用类似 jQuery 的 API HTML 解析器

module.exports = async (ctx) => {
    const { user_id } = ctx.params;

    const { data: response } = await got(`https://www.xiaohongshu.com/user/profile/${user_id}`,
        {
            headers: {
                cookie: config.xiaohongshu.cookie,
            },
        });

    const $ = cheerio.load(response);
    const js = $('body > script')

    // 鬼知道哪天小红书变了，到时候再说吧
    let json
    for (let i = 0; i < js.length; i++) {
        if (js.eq(i).text().indexOf('window.__INITIAL_STATE__={"global"') !== -1){
            json = js.eq(i).text()
        }
    }

    // 请不要问为什么这样做，因为这是小红书の魔法（bushi
    json = json.replace('window.__INITIAL_STATE__=', '')
    json = json.replace('undefined', 'null')
    json = json.replace(undefined, 'null')
    json = json.replace(/undefined/g,'null')


    let items = []

    json = JSON.parse(json)
    let xhs = json.user.notes[0]

    for (let xhsKey in xhs) {
        // 判断有没有视频
        let html = ''
        if (xhs[xhsKey].noteCard.video !== undefined){
            let videos = xhs[xhsKey].noteCard.video.media.stream
            let video
            if (videos.h264.length !== 0){
                video = videos.h264[0].masterUrl
            }else if (videos.av1.length !== 0){
                video = videos.av1[0].masterUrl
            }else if (videos.h265.length !== 0){
                video = videos.av1[0].masterUrl
            }else {
                video = 666
            }
            if (video !== 666){
                html = html + `<video src='${video}'></video>`
            }
        }

        // 小红书应该都有有图片吧
        const img = xhs[xhsKey].noteCard.imageList
        if (img.length !== 0){
            for (let imgKey in img) {
                html = html + `<img src='${img[imgKey].url}?imageView2/2/w/640/format/webp|imageMogr2/strip'>`
            }
        }

        items.push({
            guid: xhs[xhsKey].id,
            title: xhs[xhsKey].noteCard.title,
            description: `<p>${xhs[xhsKey].noteCard.desc}</p><br><br>${html}`,
            pubDate: parseDate(xhs[xhsKey].noteCard.lastUpdateTime),
            link: `https://www.xiaohongshu.com/explore/${xhs[xhsKey].noteCard.noteId}`
        })
    }

    ctx.state.data = {
        title: `${json.user.userPageData.basicInfo.nickname}的小红书笔记`,
        author: json.user.userPageData.basicInfo.nickname,
        link: `https://www.xiaohongshu.com/user/profile/${user_id}`,
        item: items
    };
};
