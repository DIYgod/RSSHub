import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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
            _: Date.now(),
        },
    });

const parseRollNewsList = (data): Array<DataItem & { link: string }> =>
    data.map((item) => ({
        title: item.title,
        description: item.intro,
        link: item.url.replace('http://', 'https://'),
        author: item.media_name,
        pubDate: item.intime ? parseDate(item.intime, 'X') : undefined,
        updated: item.mtime ? parseDate(item.mtime, 'X') : undefined,
    }));

const parseArticle = async (item: DataItem & { link: string }): Promise<DataItem> => {
    const details = await cache.tryGet(`sina:article:v5:${item.link}`, async () => {
        const details: Pick<DataItem, 'description' | 'pubDate' | 'author' | 'category'> = {};
        const detailResponse = await got(item.link);
        const $ = load(detailResponse.data);
        $('#left_hzh_ad, .appendQr_wrap, .app-kaihu-qr, .tech-quotation').remove();

        const metaPublishTime = $('meta[property="article:published_time"]').attr('content');
        const htmlPubDate = $('#pub_date, .date').text().trim();
        const htmlDate = htmlPubDate ? timezone(parseDate(htmlPubDate, ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm', 'YYYY年MM月DD日 HH:mm', 'YYYY年MM月DD日HH:mm'], true), 8) : undefined;
        const metaDate = metaPublishTime ? parseDate(metaPublishTime) : htmlDate; // 2023-05-08T08:39:31+08:00
        details.pubDate = metaDate;
        details.author = $('meta[property="article:author"]').attr('content');

        if (item.link.startsWith('https://slide.sports.sina.com.cn/') || item.link.startsWith('https://slide.tech.sina.com.cn/')) {
            const slideData = JSON.parse(
                $('script')
                    .text()
                    .match(/var slide_data = (\{.*?\})\s/)![1]
            );
            details.description = renderToString(
                <>
                    {slideData.images.map((img) => (
                        <img src={img.download_img} alt={img.intro} />
                    ))}
                </>
            );
        } else if (item.link.startsWith('https://video.sina.com.cn/')) {
            const videoId = $('script')
                .text()
                .match(/video_id:'?(.*?)'?,/)![1];

            const { data: videoResponse } = await got('https://api.ivideo.sina.com.cn/public/video/play', {
                searchParams: {
                    video_id: videoId,
                    appver: 'V11220.210521.03',
                    appname: 'sinaplayer_pc',
                    applt: 'web',
                    tags: 'sinaplayer_pc',
                    jsonp: '',
                    plid: 2_021_012_801,
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
            details.description = renderToString(
                <>
                    {videoUrl ? (
                        <video controls poster={poster ?? ''} preload="metadata">
                            <source src={videoUrl} />
                        </video>
                    ) : null}
                </>
            );
            details.pubDate = videoData.create_time ? parseDate(videoData.create_time, 'X') : undefined;
        } else if (item.link.startsWith('https://news.sina.com.cn/') || item.link.startsWith('https://mil.news.sina.com.cn/')) {
            details.description = $('#article').html();
            details.category = $('meta[name="keywords"]').attr('content')!.split(',');
        } else {
            // https://ent.sina.com.cn
            // https://finance.sina.com.cn
            // https://sports.sina.com.cn
            details.description = $('#artibody').html();
            details.category = $('#keywords').attr('data-wbkey')?.split(',');
        }

        return details;
    });
    return {
        ...item,
        ...details,
        description: details.description ?? item.description,
        author: details.author || item.author,
        pubDate: item.link.startsWith('https://video.sina.com.cn/') ? details.pubDate : (details.pubDate ?? item.pubDate),
    };
};

export { getRollNewsList, parseArticle, parseRollNewsList };
