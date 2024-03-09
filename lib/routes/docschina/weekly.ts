import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const { category = 'js' } = ctx.req.param();

    const baseURL = 'https://docschina.org';
    const path = `/news/weekly/${category}`;
    const { data: res } = await got(`${baseURL}${path}`);

    // @ts-ignore
    const $ = load(res);

    const title = $('head title').text();
    const dataEl = $('#__NEXT_DATA__');
    const dataText = dataEl.text();
    const data = JSON.parse(dataText);
    ctx.set('data', {
        title,
        link: baseURL + path,
        item: data?.props?.pageProps?.data?.map((item) => ({
            title: item.title,
            description: item.description,
            link: `${baseURL}${path}/${item.issue}`,
            author: item.editors?.join(','),
            itunes_item_image: item.imageUrl,
        })),
    });
};
