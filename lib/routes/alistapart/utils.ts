import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const getData = (url) => ofetch(url);

const getList = (data) =>
    data.map((value) => {
        const { id, title, content, date_gmt, modified_gmt, link, _embedded } = value;
        return {
            id,
            title: title.rendered,
            description: content.rendered,
            link,
            category: _embedded['wp:term'][0].map((v) => v.name),
            author: _embedded.author.map((v) => v.name).join(', '),
            pubDate: timezone(parseDate(date_gmt), 0),
            updated: timezone(parseDate(modified_gmt), 0),
        };
    });

export { getData, getList };
