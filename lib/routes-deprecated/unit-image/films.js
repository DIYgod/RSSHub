const got = require('@/utils/got');

module.exports = async (ctx) => {
    const type = ctx.params.type ? `?filter=${ctx.params.type}` : '';
    const dataurl = `https://www.unit-image.fr/data/en/wp-json/unitimage/v1/films${type}`;
    const response = await got({
        method: 'get',
        url: dataurl,
    });
    const data = response.data;
    const list = data.content.posts.slice(0, 5);
    const articledata = await Promise.all(
        list.map(async (item) => {
            const url = `https://www.unit-image.fr/data/en/wp-json/unitimage/v1${item.href}`; // 获取所有文章URL
            const cache = await ctx.cache.get(url); // 这里是不是单单缓存 URL？
            if (cache) {
                return JSON.parse(cache); // 如果有 URL 的缓存，则返回 JSON.phrase 的数据
            }
            const response2 = await got({
                method: 'get',
                url,
            });
            // data2为每文章数据
            const data2 = response2.data;

            const infosdata = data2.infos || []; // 文章数据返回为data
            const slideshowdata = data2.caseStudy.slideshow || [];
            const storyboarddata = data2.caseStudy.storyboard || [];
            const bhtsdata = data2.behindTheScene[0] || {};
            const compare0 = data2.caseStudy.compare[0] || {};
            const compare1 = data2.caseStudy.compare[1] || {};
            const infos = infosdata.map((item) => ({
                infolabel: item.label, // 项目信息
                infovalue: item.value,
            }));
            const images = slideshowdata.map((item) => ({
                image: item.img, // 图片组
            }));
            const storyboard = storyboarddata.map((item) => ({
                storyboard0: item.items[0].img, // 故事板上
                storyboard1: item.items[1].img, // 故事板下
            }));
            const video = {
                // 主视频
                mp4: data2.video.mp4.url,
                youtube: data2.video.youtube,
                vimeo: data2.video.vimeo,
            };
            const compare = {
                // 对比视频 感谢@piggy_usera 教我用 ["值"] 选择带有横杠的值！但是不能一开始就const不知道为什么。
                compare0: compare0['video-mp4'],
                compare1: compare1['video-mp4'],
            };
            const bhts = {
                // Behind The Scene
                mp4: bhtsdata['video-mp4'],
                youtube: bhtsdata['youtube-id'],
                vimeo: bhtsdata['vimeo-id'],
            };

            const single = {
                infos,
                images,
                storyboard,
                video,
                compare,
                bhts,
            };
            ctx.cache.set(url, JSON.stringify(single)); // 设定缓存为序列化文章数据
            return single; // 返回 articledata 为序列化文章数据。
        })
    );

    ctx.state.data = {
        // 源标题
        title: `Unit Image | ${ctx.params.type}`,
        // 源链接
        link: `https://www.unit-image.fr/films`,
        // 源说明
        description: `Unit Images Films`,
        // 遍历此前获取的数据
        item: list.map((item, index) => {
            let content = '';
            const videostyle = `width="640" height="360"`;
            const imgstyle = `style="max-width: 650px; height: auto; object-fit: contain; flex: 0 0 auto;"`;

            // 运用index数组ID来匹配文章ID！参考来自instagram！
            // 项目信息
            if (articledata[index].infos) {
                for (let i = 0; i < articledata[index].infos.length; i++) {
                    content += `${articledata[index].infos[i].infolabel}:${articledata[index].infos[i].infovalue}<br>`;
                }
            }
            // 不同源主视频
            if (articledata[index].video.mp4) {
                content += `<video width="100%" controls="controls" ${videostyle} source src="${articledata[index].video.mp4}" type="video/mp4"></video><br>`;
            } else if (articledata[index].video.vimeo) {
                content += `<iframe ${videostyle} src='https://player.vimeo.com/video/${articledata[index].video.vimeo}' frameborder='0' webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe><br>`;
            } else if (articledata[index].video.youtube) {
                content += `<iframe id="ytplayer" type="text/html" ${videostyle} src='https://youtube.com/embed/${articledata[index].video.youtube}' frameborder='0' webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe><br>`;
            }
            // 不同源幕后视频

            if (articledata[index].bhts.mp4) {
                content += `Behind The Scene:<br><video width="100%" controls="controls" ${videostyle} source src="${articledata[index].bhts.mp4.url}" type="video/mp4"></video><br>`;
            } else if (articledata[index].bhts.vimeo) {
                content += `Behind The Scene:<br><iframe ${videostyle} src='https://player.vimeo.com/video/${articledata[index].bhts.vimeo}' frameborder='0' webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe><br>`;
            } else if (articledata[index].bhts.youtube) {
                content += `Behind The Scene:<br><iframe id="ytplayer" type="text/html" ${videostyle} src='https://youtube.com/embed/${articledata[index].bhts.youtube}' frameborder='0' webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe><br>`;
            }

            // 项目图片
            if (articledata[index].images) {
                for (let p = 0; p < articledata[index].images.length; p++) {
                    content += `<img ${imgstyle} src="${articledata[index].images[p].image}"><br>`;
                }
            }
            // 故事板
            if (articledata[index].storyboard.length > 0) {
                let storyboard = '';
                for (let s = 0; s < articledata[index].storyboard.length; s++) {
                    storyboard += `<tr><td><img ${imgstyle} src="${articledata[index].storyboard[s].storyboard0}"><td/><td><img ${imgstyle} src="${articledata[index].storyboard[s].storyboard1}"></td></tr>`;
                }
                content += `<table><tr><th colspan="2" style="background-color: #333; color: #fff;">Storyboard</th></tr>${storyboard}<table><br>`;
            }

            // 对比视频
            if (articledata[index].compare.compare0) {
                content += `Compare:<br><video width="100%" controls="controls" ${videostyle}><source src="${articledata[index].compare.compare0.url}" type="video/mp4"></video><br><video width="100%" controls="controls" ${videostyle}><source src="${articledata[index].compare.compare1.url}" type="video/mp4"></video><br>`;
            }
            return {
                title: item.title,
                description: content,
                link: `https://www.unit-image.fr${item.href}`,
                pubDate: item.preview.mp4.date,
            };
        }),
    };
};
// 数据返回样式：http://www.unit-image.fr/data/en/wp-json/unitimage/v1/film/baldurs-gate-3-intro
// 非常感谢@xunco @johnson_Flex @lemonplusplus @yeFoenix @piggy_user
