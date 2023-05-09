const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const { join } = require('path');

module.exports = async (ctx) => {
    const { type = 'volley' } = ctx.params;

    let currentUrl = `https://sports.sina.com.cn/others/${type}.shtml`,
        query = 'ul.list2 li a';

    if (type === 'ufc') {
        currentUrl = 'http://roll.sports.sina.com.cn/s_ufc_all/index.shtml';
        query = '#d_list ul li span a';
    } else if (type === 'winter' || type === 'horse') {
        currentUrl = `https://sports.sina.com.cn/${type}/`;
        query = '[class^=news-list] .list li a';
    }

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $(query)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href').replace('http://', 'https://'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);
                content('#left_hzh_ad').remove();

                const metaPublishTime = content('meta[property="article:published_time"]');
                const htmlPubDate = content('#pub_date, .date');
                const htmlDate = htmlPubDate.length ? parseDate(htmlPubDate.text(), ['YYYY年MM月DD日 HH:mm', 'YYYY年MM月DD日HH:mm']) : null;
                item.pubDate = metaPublishTime.length ? parseDate(metaPublishTime.attr('content')) : htmlDate; // 2023-05-08T08:39:31+08:00
                item.author = content('meta[property="article:author"]').attr('content');

                if (item.link.startsWith('https://slide.sports.sina.com.cn/')) {
                    const slideData = JSON.parse(
                        content('script')
                            .text()
                            .match(/var slide_data = (\{.*?\})\s/)[1]
                    );
                    item.description = art(join(__dirname, 'templates/slide.art'), { slideData });
                } else if (item.link.startsWith('https://video.sina.com.cn/')) {
                    const videoId = content('script')
                        .text()
                        .match(/video_id:'?(.*?)'?,/)[1];

                    const { data: videoResponse } = await got({
                        method: 'get',
                        url: 'https://api.ivideo.sina.com.cn/public/video/play',
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
                } else {
                    item.description = content('#artibody').html();
                    item.category = content('#keywords').data('wbkey')?.split(',');
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('title').text().split('_')[0]} - 新浪体育`,
        description: $('meta[name="description"]').attr('content'),
        link: currentUrl,
        item: items,
    };
};
