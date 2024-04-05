import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
import { art } from '@/utils/render';
import path from 'node:path';

const getData = async (ctx, list) => {
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                const data = JSON.parse($('script#__NEXT_DATA__').text());
                const type = data.props.pageProps.article.type.toLowerCase();

                item.pubDate = new Date(data.props.pageProps.article.publishedAt).toUTCString();

                if (type === 'video') {
                    item.description = art(path.join(__dirname, 'templates/video.art'), { article: data.props.pageProps.article });
                } else {
                    // Essay or Audio
                    // But unfortunately, the method based on __NEXT_DATA__
                    // does not include the information of the audio link.

                    // Besides, it seems that the method based on __NEXT_DATA__
                    // does not include the information of the two-column
                    // images in the article body,
                    // e.g. https://aeon.co/essays/how-to-mourn-a-forest-a-lesson-from-west-papua .
                    // But that's very rare.

                    item.author = data.props.pageProps.article.authors.map((author) => author.name).join(', ');

                    const article = data.props.pageProps.article;
                    const capture = load(article.body);
                    const banner = article.image?.url;
                    capture('p.pullquote').remove();

                    const authorsBio = article.authors.map((author) => '<p>' + author.name + author.authorBio.replaceAll(/^<p>/g, ' ')).join('');

                    item.description = art(path.join(__dirname, 'templates/essay.art'), { banner, authorsBio, content: capture.html() });
                }

                return item;
            })
        )
    );

    return items;
};

export { getData };
