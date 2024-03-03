// @ts-nocheck
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
const articleApiRootUrl = 'https://www.lifeweek.com.cn/api/article';

async function getRssItem(item, articleLink) {
    const articleApiLink = `${articleApiRootUrl}/${item.id}`;
    const { data } = await got(articleApiLink);
    const time = timezone(parseDate(item.pubTime), +8);
    return {
        title: item.title,
        description: data.model.content,
        link: articleLink,
        pubDate: time,
    };
}

module.exports = getRssItem;
