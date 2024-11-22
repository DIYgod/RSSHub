import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export async function getNovelLanguage(novelId: string): Promise<string> {
    return (await cache.tryGet(`https://www.pixiv.net/novel/show.php?id=${novelId}`, async () => {
        const rsp = await got(`https://www.pixiv.net/novel/show.php?id=${novelId}`);
        const $ = load(rsp.data);
        const data = JSON.parse($('#meta-preload-data').attr('content'));
        return data?.novel[novelId].language;
    })) as string;
}
