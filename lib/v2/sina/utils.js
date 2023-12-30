const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { art } = require('@/utils/render');
const { join } = require('path');

const getRollNewsList = (pageid, lid, limit) =>
    got('https://feed.mix.sina.com.cn/api/roll/get', {
        headers: {
            referer: 'https://news.sina.com.cn/',
        },
        searchParams: {
            pageid,
            lid,
            k: '',
            num: limit,
            page: 1,
            r: Math.random(),
            _: new Date().getTime(),
        },
    });

const parseRollNewsList = (data) =>
    data.map((item) => ({
        title: item.title,
        description: item.intro,
        link: item.url.replace('http://', 'https://'),
        author: item.media_name,
        pubDate: parseDate(item.intime, 'X'),
        updated: parseDate(item.mtime, 'X'),
    }));

const parseArticle = (item, tryGet) =>
    tryGet(item.link, async () => {
        const detailResponse = await got(item.link);
        const $ = cheerio.load(detailResponse.data);
        $('#left_hzh_ad, .appendQr_wrap, .app-kaihu-qr, .tech-quotation').remove();

        const metaPublishTime = $('meta[property="article:published_time"]');
        const htmlPubDate = $('#pub_date, .date');
        const htmlDate = htmlPubDate.length ? timezone(parseDate(htmlPubDate.text(), ['YYYY年MM月DD日 HH:mm', 'YYYY年MM月DD日HH:mm']), 8) : null;
        const metaDate = metaPublishTime.length ? parseDate(metaPublishTime.attr('content')) : htmlDate; // 2023-05-08T08:39:31+08:00
        item.pubDate = item.pubDate ? item.pubDate : metaDate;
        item.author = $('meta[property="article:author"]').attr('content');

        if (item.link.startsWith('https://slide.sports.sina.com.cn/') || item.link.startsWith('https://slide.tech.sina.com.cn/')) {
            const slideData = JSON.parse(
                $('script')
                    .text()
                    .match(/var slide_data = (\{.*?\})\s/)[1]
            );
            item.description = art(join(__dirname, 'templates/slide.art'), { slideData });
        } else if (item.link.startsWith('https://video.sina.com.cn/')) {
            const videoId = $('script')
                .text()
                .match(/video_id:'?(.*?)'?,/)[1];

            const { data: videoResponse } = await got('https://api.ivideo.sina.com.cn/public/video/play', {
                searchParams: {
                    video_id: videoId,
                    appver: 'V11220.210521.03',
                    appname: 'sinaplayer_pc',
                    applt: 'web',
                    tags: 'sinaplayer_pc',
                    jsonp: '',
                    plid: 2021012801,
                    prid: '',
                    uid: '',
                    tid: '',
                    pid: 1,
                    ran: Math.random(),
                    r: item.link,
                    ssid: `gusr_pc_${Date.now()}`,
                    preload: 0,
                    uu: '',
                    isAuto: 1,
                },
            });

            const videoData = videoResponse.data;
            const poster = videoData.image;
            const videoUrl = videoData.videos.find((v) => v.type === 'mp4').dispatch_result.url;
            item.description = art(join(__dirname, 'templates/video.art'), { poster, videoUrl });
            item.pubDate = parseDate(videoData.create_time, 'X');
        } else if (item.link.startsWith('https://news.sina.com.cn/') || item.link.startsWith('https://mil.news.sina.com.cn/')) {
            item.description = $('#article').html();
            item.category = $('meta[name="keywords"]').attr('content').split(',');
        } else {
            // https://ent.sina.com.cn
            // https://finance.sina.com.cn
            // https://sports.sina.com.cn
            item.description = $('#artibody').html();
            item.category = $('#keywords').data('wbkey')?.split(',');
        }

        return item;
    });

module.exports = {
    getRollNewsList,
    parseRollNewsList,
    parseArticle,
};
