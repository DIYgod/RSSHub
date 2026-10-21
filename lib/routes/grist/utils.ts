import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const getData = (url) => ofetch(url);

const getList = (data) =>
    data.map((value) => {
        const { id, title, content, date_gmt, modified_gmt, link, _embedded, featured_media } = value;
        const { 'wp:featuredmedia': media, author } = _embedded;
        const image = media?.find((v) => v.id === featured_media) || { source_url: '' };
        return {
            id,
            title: title.rendered,
            description: content.rendered,
            link,
            itunes_item_image: image.source_url,
            category: _embedded['wp:term'][0].map((v) => v.name),
            author: value.parsely?.meta?.creator?.join(', ') || author?.map((v) => v.name).join(', '),
            pubDate: date_gmt ? timezone(parseDate(date_gmt), 0) : undefined,
            updated: modified_gmt ? timezone(parseDate(modified_gmt), 0) : undefined,
        };
    });

export { getData, getList };
