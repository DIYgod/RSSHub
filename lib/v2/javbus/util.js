const got = require('@/utils/got');
const { load } = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

exports.getDomain = (ctx) => `https://www.${ctx.query.domain ?? 'javbus.com'}`;

exports.getWesternDomain = (ctx) => `https://www.${ctx.query.western_domain ?? 'javbus.red'}`;

exports.getPage = async (url, ctx) => {
    const { data } = await got(url);
    const $ = load(data);

    const pageTitle = `JavBus - ${$('head > title').text().replace(' - JavBus', '')}`;

    return {
        title: pageTitle,
        link: url,
        description: pageTitle,
        item: await Promise.all(parseItems($, ctx)),
    };
};

const parseItems = ($, ctx) =>
    $('.movie-box')
        .map((_, ele) => ({
            title: $(ele).find('img').attr('title'),
            thumb: $(ele).find('img').attr('src'),
            link: $(ele).attr('href'),
            pubDate: parseDate($(ele).find('date:nth-child(4)').text(), 'YYYY-MM-DD'),
            aid: $(ele).find('date:nth-child(3)').text(),
        }))
        .toArray()
        .map(async ({ title, thumb, link, pubDate, aid }) => {
            const detail = await getDetail(link, ctx);
            title = `${aid} ${title}${detail.filmTime}`;
            if (detail.screenData) {
                detail.imgHTML = detail.screenData.map((url) => `<img src="${url}"><br />`);
            }
            return {
                title,
                link,
                pubDate,
                description: `
        <h3>${title}</h3>
        <br />
        <img src="${thumb.replace(/\/thumbs?\//, '/cover/').replace('.jpg', '_b.jpg')}" />
        ${detail.filmId ? `<h3>識別碼 : ${detail.filmId}</h3>` : ''}
        ${detail.filmTime ? `<h3>发售日期 : ${detail.filmTime}</h3>` : ''}
        ${detail.actresses ? `<h3>女优 : ${detail.actresses}</h3>` : ''}
        ${detail.filmEstabName ? `<h3>發行商 : ${detail.filmEstabName}</h3>` : ''}
        ${detail.filmMakerbName ? `<h3>製作商 : ${detail.filmMakerbName}</h3>` : ''}
        ${detail.seriesName ? `<h3>系列 : ${detail.seriesName}</h3>` : ''}
        ${detail.filmLast ? `<h3>影片时长 : ${detail.filmLast}</h3>` : ''}
        ${detail.screenData ? `<h3>影片截图 : </h3>${detail.imgHTML.join('')}` : ''}
        ${detail.videolink ? `<h3>在线观看 : ${detail.videolink}</h3>` : ''}
        ${detail.magnetlinks ? `<h3>下载地址 : </h3><br />${detail.magnetlinks.join('')}` : ''}
        ${detail.videoplayer ? `<hr /><h3>视频预览 : </h3><br />${detail.videoplayer}` : ''}
    `.trim(),
            };
        });

const getDetail = async (link, ctx) =>
    await ctx.cache.tryGet(link, async () => {
        const resp = await got(link);
        const detailPage = resp.data;
        // 演员
        const actressReg = /<a class="avatar-box"[\s\S]*?<\/a>/g;
        let match = detailPage.match(actressReg);
        let actresses = [];
        if (match) {
            match.map((i) => {
                const name = /<span>(.*?)<\/span>/.exec(i)[1];
                actresses = actresses.concat(name);
                return null;
            });
        } else {
            actresses = null; // []
        }
        // 影片详情
        // const filmCover = /<a class="bigImage" href="(.*?)"/.exec(detailPage)[1];
        // const filmName = /<a class="bigImage" href="(.*?)" title="(.*?)"/.exec(detailPage)[2];
        let filmId = /<span style="color:#CC0000;">([\s\S]*?)<\/span>/.exec(detailPage);
        if (filmId) {
            filmId = filmId[1];
        } else {
            filmId = null;
        }

        let filmTime = /<span class="header">發行日期:<\/span>([\s\S]*?)<\/p>/.exec(detailPage);
        if (filmTime) {
            filmTime = filmTime[1];
        } else {
            filmTime = null;
        }

        let filmLast = /<span class="header">長度:<\/span>([\s\S]*?)<\/p>/.exec(detailPage);
        if (filmLast) {
            const lastmins = /\d+/.exec(filmLast[1]);
            if (lastmins) {
                const hours = Math.floor(lastmins / 60);
                let mins = lastmins % 60;
                mins = mins === 0 ? '00' : mins;
                filmLast = hours + ':' + mins;
            } else {
                filmLast = null;
            }
        } else {
            filmLast = null;
        }
        let filmEstabName = /<span class="header">發行商:[\s\S]*?"(.*?)">(.*?)<\/a>/.exec(detailPage);
        if (filmEstabName) {
            filmEstabName = filmEstabName[2];
        } else {
            filmEstabName = null;
        }

        let filmMakerbName = /<span class="header">製作商:[\s\S]*?"(.*?)">(.*?)<\/a>/.exec(detailPage);
        if (filmMakerbName) {
            filmMakerbName = filmMakerbName[2];
        } else {
            filmMakerbName = null;
        }
        let seriesName = /<span class="header">系列:[\s\S]*?"(.*?)">(.*?)<\/a>/.exec(detailPage);
        if (seriesName) {
            seriesName = seriesName[2];
        } else {
            seriesName = null;
        }
        let directorName = /<span class="header">導演:[\s\S]*?"(.*?)">(.*?)<\/a>/.exec(detailPage);
        if (directorName) {
            directorName = directorName[2];
        } else {
            directorName = null;
        }

        const code = /<span class="header">識別碼:[\s\S]*?">([\s\S]*?)<\/span>/.exec(detailPage)[1];
        // 影片截图
        const regScreenshot = /<a class="sample-box" href="(.*?)"[\s\S]*?<img src="(.*?)">/g;
        match = detailPage.match(regScreenshot);
        let screenData = [];
        if (match) {
            screenData = match.map((i) => /<a class="sample-box" href="(.*?)"[\s\S]*?<img src="(.*?)">/g.exec(i)[1]);
        } else {
            screenData = null;
        }

        let magnetlinks = [];
        try {
            const filmGid = /gid = ([0-9]*?);/.exec(detailPage);
            const filmUc = /uc = ([0-9]*?);/.exec(detailPage);
            const filmImg = /var img = '(.*?)';/.exec(detailPage);
            const filmFloor = Math.floor(Math.random() * 1000 + 1);
            const apiurl = `${exports.getDomain(ctx)}/ajax/uncledatoolsbyajax.php?gid=${filmGid[1]}&lang=zh&img=${filmImg[1]}&uc=${filmUc[1]}&floor=${filmFloor}`;
            const apiresp = await got({
                method: 'get',
                url: apiurl,
                headers: {
                    Referer: link,
                },
            });
            const magnettable = apiresp.data;
            match = magnettable.match(/<tr onmouseover=[\s\S]*?<\/tr>/gm);
            if (match) {
                magnetlinks = match.map((str) => {
                    // magnet地址
                    const mlink = /td width="70%" onclick="window.open\('(magnet.*?)',/.exec(str)[1];
                    // console.log(str);
                    // 提取a链接
                    const mrow = str.match(/<a [\s\S]*?magnet[\s\S]*?">([\s\S]*?)</gm);
                    // magnet名称
                    const mname = /<a [\s\S]*?magnet[\s\S]*?">([\s\S]*?)</.exec(mrow[0])[1].trim();
                    // magnet大小
                    const msize = /<a [\s\S]*?magnet[\s\S]*?">([\s\S]*?)</.exec(mrow[1])[1].trim();
                    // return "<a href=\""+mlink+"\">"+mname+" -- "+msize+ "<\/a><textarea readonly rows=\"5\" cols=\"50\">"+ mlink + "<\/textarea><br \/>";
                    return '<a href="' + mlink + '">' + mname + ' -- ' + msize + '</a><br />';
                });
            } else {
                magnetlinks = null;
            }
        } catch (e) {
            magnetlinks = null;
        }

        let videolink = null;
        let videoplayer = null;
        const avgleurl = `https://api.avgle.com/v1/jav/${filmId}/0`;
        try {
            // 尝试通过Avgle接口获取视频信息
            const avgleresp = await got.get(avgleurl);
            // 获取到的视频数量
            const videonum = avgleresp.data.response.total_videos;
            // 获取到的视频地址
            const videos = avgleresp.data.response.videos;
            if (videonum > 0) {
                // 获取完整的视频地址
                const embedded_url = videos[0].embedded_url;
                videolink = `<a href="${embedded_url}?referer=t66y.com">点击观看完整视频</a>`;
                const preview_url = videos[0].preview_url;
                if (videos[0].hasOwnProperty('preview_video_url')) {
                    // 获取预览视频地址
                    const preview_video_url = videos[0].preview_video_url;
                    videoplayer = `<video controls="controls" poster="${preview_url}?referer=t66y.com" src="${preview_video_url}?referer=t66y.com"> </video>`;
                }
            }
        } catch (err) {
            // 无需处理
        }

        const detail = { actresses, filmId, filmTime, filmLast, filmEstabName, filmMakerbName, seriesName, directorName, code, screenData, magnetlinks, videoplayer, videolink };
        return detail;
    });
