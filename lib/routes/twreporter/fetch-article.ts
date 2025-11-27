import path from 'node:path';

import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

export default async function fetch(slug: string) {
    const url = `https://go-api.twreporter.org/v2/posts/${slug}?full=true`;
    const res = await ofetch(url);
    const post = res.data;

    const time = post.published_date;
    // For `writers`
    let authors = '';
    if (post.writers) {
        authors = post.writers.map((writer) => (writer.job_title ? writer.job_title + ' / ' + writer.name : '文字 / ' + writer.name)).join('，');
    }

    // For `photography`, if it exists
    let photographers = '';
    if (post.photographers) {
        photographers = post.photographers
            .map((photographer) => {
                let title = '攝影 / ';
                if (photographer.job_title) {
                    title = photographer.job_title + ' / ';
                }
                return title + photographer.name;
            })
            .join('，');
        authors += '；' + photographers;
    }

    // Prioritize hero_image, but fall back to og_image if it's missing
    const imageSource = post.hero_image ?? post.og_image;
    const bannerImage = imageSource?.resized_targets.desktop.url;
    const caption = post.leading_image_description;
    const bannerDescription = imageSource?.description ?? '';
    const ogDescription = post.og_description;
    // Only render the banner if we successfully found an image URL
    const banner = imageSource ? art(path.join(__dirname, 'templates/image.art'), { image: bannerImage, description: bannerDescription, caption }) : '';

    function format(type, content) {
        let block = '';
        if (content !== '' && type !== 'embeddedcode') {
            switch (type) {
                case 'image':
                case 'slideshow':
                    block = content.map((image) => art(path.join(__dirname, 'templates/image.art'), { image: image.desktop.url, description: image.description, caption: image.description })).join('<br>');

                    break;

                case 'blockquote':
                    block = `<blockquote>${content}</blockquote>`;

                    break;

                case 'header-one':
                    block = `<h1>${content}</h1>`;

                    break;

                case 'header-two':
                    block = `<h2>${content}</h2>`;

                    break;

                case 'infobox': {
                    const box = content[0];
                    block = `<h2>${box.title}</h2>${box.body}`;

                    break;
                }
                case 'youtube': {
                    const video = content[0].youtubeId;
                    const id = video.split('?')[0];
                    block = art(path.join(__dirname, 'templates/youtube.art'), { video: id });

                    break;
                }
                case 'quoteby': {
                    const quote = content[0];
                    block = `<blockquote>${quote.quote}</blockquote><p>${quote.quoteBy}</p>`;

                    break;
                }
                default:
                    block = `${content}<br>`;
            }
        }
        return block;
    }

    const text = post.content.api_data
        .map((item) => {
            const content = item.content;
            const type = item.type;
            return format(type, content);
        })
        .filter(Boolean)
        .join('<br>');
    const contents = [banner, ogDescription, text].filter(Boolean).join('<br><br>');

    return {
        author: authors,
        description: contents,
        link: `https://www.twreporter.org/a/${slug}`,
        guid: `https://www.twreporter.org/a/${slug}`,
        pubDate: parseDate(time, 'YYYY-MM-DDTHH:mm:ssZ'),
    };
}
