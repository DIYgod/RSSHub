import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import { art } from '@/utils/render';
import path from 'node:path';
import { config } from '@/config';
import { parseDate } from '@/utils/parse-date';

export const getBuildId = () =>
    cache.tryGet(
        'aeon:buildId',
        async () => {
            const response = await ofetch('https://aeon.co');
            const $ = load(response);
            const nextData = JSON.parse($('script#__NEXT_DATA__').text());
            return nextData.buildId;
        },
        config.cache.routeExpire,
        false
    );

const getData = async (list) => {
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const buildId = await getBuildId();
                const response = await ofetch(`https://aeon.co/_next/data/${buildId}/${item.type}s/${item.slug}.json?id=${item.slug}`);

                const data = response.pageProps.article;
                const type = data.type.toLowerCase();

                item.pubDate = parseDate(data.publishedAt);

                if (type === 'video') {
                    item.description = art(path.join(__dirname, 'templates/video.art'), { article: data });
                } else {
                    if (data.audio?.id) {
                        const response = await ofetch('https://api.aeonmedia.co/graphql', {
                            method: 'POST',
                            body: {
                                query: `query getAudio($audioId: ID!) {
                                    audio(id: $audioId) {
                                        id
                                        streamUrl
                                    }
                                }`,
                                variables: {
                                    audioId: data.audio.id,
                                },
                                operationName: 'getAudio',
                            },
                        });

                        delete item.image;
                        item.enclosure_url = response.data.audio.streamUrl;
                        item.enclosure_type = 'audio/mpeg';
                    }

                    // Besides, it seems that the method based on __NEXT_DATA__
                    // does not include the information of the two-column
                    // images in the article body,
                    // e.g. https://aeon.co/essays/how-to-mourn-a-forest-a-lesson-from-west-papua .
                    // But that's very rare.

                    const capture = load(data.body, null, false);
                    const banner = data.image;
                    capture('p.pullquote').remove();

                    const authorsBio = data.authors.map((author) => '<p>' + author.name + author.authorBio.replaceAll(/^<p>/g, ' ')).join('');

                    item.description = art(path.join(__dirname, 'templates/essay.art'), { banner, authorsBio, content: capture.html() });
                }

                return item;
            })
        )
    );

    return items;
};

export { getData };
