// @ts-nocheck
import { parseDate } from '@/utils/parse-date';

const parseItem = (data) =>
    data.map((item) => ({
        title: item.title.rendered,
        description: item.content.rendered,
        pubDate: parseDate(item.date_gmt),
        link: item.link,
    }));

module.exports = {
    parseItem,
};
