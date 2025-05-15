import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.cnbeta.com.tw';

const ProcessItems = (items, limit, tryGet) =>
    Promise.all(
        items.slice(0, limit ? Number.parseInt(limit) : 60).map((item) =>
            tryGet(item.link, async () => {
                const detailResponse = await got(item.link);

                const content = load(detailResponse.data);

                content('.topic, .article-topic, .article-global').remove();

                item.description = content('.article-summary').html() + content('.article-content').html();
                item.author = content('header.title div.meta span.source').text();
                item.pubDate ??= timezone(parseDate(content('.meta span').first().text(), 'YYYY年MM月DD日 HH:mm'), +8);

                return item;
            })
        )
    );

export { rootUrl, ProcessItems };
