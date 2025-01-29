import { parseDate } from '@/utils/parse-date';
import { WPPost } from './types';

function loadArticle(item: WPPost) {
    return {
        title: item.title.rendered,
        description: item.content.rendered,
        pubDate: parseDate(item.date_gmt),
        link: item.link,
    };
}

export default loadArticle;
