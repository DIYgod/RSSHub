import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

const processItems = (list) =>
    Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got.post(item.link);
                const content = load(detailResponse.data);

                item.description = content('div.xxy_text').html();

                return item;
            })
        )
    );

export { processItems };
