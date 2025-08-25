import { parseDate } from '@/utils/parse-date';

function parseItems(it) {
    const title = it.find('.entry-title').children().first();
    const href = title.attr('href');
    const titleTxt = title.text();
    const img = it.find('video.wp-video-shortcode').attr('data-poster-image');
    const cat = it.find('.entry-categories-inner').children();
    const stats = it.find('.entry-stats');

    return {
        title: titleTxt,
        link: href,
        guid: href,
        pubDate: parseDate(new Date().toISOString()),
        author: 'NA',
        description: `${cat} <img src='${img}'></img> ${stats}`,
    };
}

export { parseItems };
