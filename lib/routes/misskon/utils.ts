import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const ENDPOINT = 'https://misskon.com/wp-json/wp/v2';
const getPosts = async (searchParams) => {
    const url = new URL(`${ENDPOINT}/posts?${searchParams}`);
    url.searchParams.append('_embed', 'wp:term');
    const data = await ofetch(url.href);
    return data.map((item) => {
        const $ = load(item.content.rendered);
        $('input').each(function () {
            $(this).replaceWith($(this).attr('value') || '');
        });
        $('script').remove();
        return {
            title: item.title.rendered,
            link: item.link,
            description: $.html(),
            pubDate: timezone(parseDate(item.date_gmt), 0),
            category: item._embedded['wp:term']
                .flat()
                .filter((x) => x.taxonomy === 'post_tag')
                .map((x) => x.name),
        };
    });
};
const getTags = async (slug) => {
    const data = await ofetch(`${ENDPOINT}/tags?slug=${slug}`);
    if (data.length === 0) {
        throw new Error(`Invalid tag slug: ${slug}`);
    }
    return {
        id: data[0].id,
        name: data[0].name,
        link: data[0].link,
        description: data[0].description,
    };
};
export { ENDPOINT, getPosts, getTags };
