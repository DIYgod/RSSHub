import { load } from 'cheerio';

import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { renderDescription } from './templates/description';

interface VideoResponse {
    data?: {
        flag?: string;
        videoUrl?: string;
        videoFirstFrame?: string;
        ptime?: string;
        userName?: string;
    };
}

const parseArticle = async (item) => {
    const article = await cache.tryGet(`oeeee:article:${item.link}`, async () => {
        const detailResponse = await got({
            method: 'get',
            url: item.link,
        });

        const content = load(detailResponse.data);
        let description;
        const publishedTime = content('meta[property="article:published_time"]').attr('content');
        let pubDate = publishedTime ? parseDate(publishedTime) : undefined;

        // nfapp page:
        if (content('.post-cont') && content('.post-cont').html()) {
            content('img').removeAttr('data-width').removeAttr('data-height').removeAttr('class').removeAttr('title').removeAttr('referrerpolicy');
            content('.taglist, .J_ndlogo, .zan-shang, .sourcelist-box, #shareContain, .buyCopyright, .article-info, .icon, .special').remove();
            description =
                content('.post-cont')
                    .html()!
                    .replaceAll(/data:image\S*=="\s*original="/g, '') ?? '';
            if (!pubDate && content('.introduce').text()) {
                pubDate = timezone(parseDate(content('.introduce').text()), 8);
            }
        }
        // oeeee news page:
        else if (content('.content') && content('.content').html()) {
            description = content('.content').html() ?? '';
        }
        // oeeee news page #2:
        else if (content('.article-conten') && content('.article-conten').html()) {
            description = content('.article-conten').html() ?? '';
        }

        const authors = content('meta[property="article:author"]')
            .toArray()
            .map((author) => content(author).attr('content'))
            .filter((author): author is string => Boolean(author));

        let author = authors.length ? authors.map((name) => ({ name })) : undefined;
        const docId = new URL(item.link).pathname.match(/^\/a\/([A-Z0-9]+)\.html$/)?.[1];
        if (!description && docId && content('script[src*="/nd-media/assets/video-"]').length) {
            const { data } = await ofetch<VideoResponse>('https://api-ndapp.oeeee.com/nd-mobile-api/web/doc/getDetail', { query: { docid: docId } });
            if (data?.flag === 'video') {
                description = renderDescription({ videoUrl: data.videoUrl, videoPoster: data.videoFirstFrame });
                pubDate = data.ptime ? timezone(parseDate(data.ptime, 'YYYY-MM-DD HH:mm:ss'), 8) : pubDate;
                author = data.userName ? [{ name: data.userName }] : author;
            }
        }

        return { description, pubDate, author };
    });

    return {
        ...item,
        description: `${item.description ?? ''}${article.description ?? ''}`,
        pubDate: item.pubDate ?? article.pubDate,
        author: article.author ?? item.author,
    };
};

export { parseArticle };
