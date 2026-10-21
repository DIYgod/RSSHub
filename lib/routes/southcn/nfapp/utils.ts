import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { renderDescription } from '../templates/description';

export type ArticleSource = { item: DataItem & { link: string }; articleId: number | string };

type VideoArticle = {
    content?: string;
    author?: string;
    videoUrl?: string;
    imageUrl?: string;
    picMiddle?: string;
    videos?: Array<{ ref: string; videoarray: Array<{ videoUrl: string; imageUrl?: string }> }>;
};

const renderVideoContent = (article: VideoArticle) => {
    let content = article.content || '';
    const groups = article.videos || [];
    for (const group of groups) {
        const videos = group.videoarray.map((video) => renderDescription({ videoUrl: video.videoUrl, thumb: video.imageUrl })).join('');
        content = content.replaceAll(group.ref, () => videos);
    }
    if (!article.videos?.length && article.videoUrl) {
        content = renderDescription({ videoUrl: article.videoUrl, thumb: article.imageUrl || article.picMiddle }) + content;
    }
    return content;
};

const parseArticle = async (item: DataItem & { link: string }, articleId: number | string) => {
    const detail = await cache.tryGet(`${item.link}:content-v5`, async () => {
        if (new URL(item.link).pathname === '/apptpl/videoToShare/index.html') {
            const { data: article } = await got(`https://api.nfnews.com/nanfang_if/getArticleContent?articleId=${articleId}&version=5.0.0`);
            return { description: renderVideoContent(article), author: article.author };
        }
        const detailResponse = await got({
            method: 'get',
            url: item.link,
        });

        const $ = load(detailResponse.data);

        $('.article-nfh-icon, .article-crumb, .article-share, .article-copyright').remove();

        const content = $('#articleContainer .article, #content').first();
        content.find('img[data-original]').each((_, element) => {
            const image = $(element);
            const source = image.attr('data-original');
            if (source) {
                image.attr('src', source);
            }
        });
        return {
            description: content.html(),
            author: $('meta[name="author"]').attr('content'),
        };
    });
    return { ...item, description: detail.description || item.description, author: detail.author };
};

export { parseArticle };
