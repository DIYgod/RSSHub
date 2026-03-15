import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import cache from '@/utils/cache';
import { PRESETS } from '@/utils/header-generator';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const getArticleDetails = async (items) => {
    const list = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const url = item.link;
                const html = await ofetch(url, {
                    headerGeneratorOptions: PRESETS.MODERN_ANDROID,
                });
                const $ = load(html);
                let data = JSON.parse($('script#__NEXT_DATA__').text());

                const list = data.props.pageProps.urqlState;
                const keyWithContent = Object.keys(list).filter((key) => list[key].data.includes('content'));
                data = JSON.parse(list[keyWithContent].data).article;

                item.title = data.shareTitle;
                item.category = data.categories.map((category) => category.slug);
                for (const channel of data.channels) {
                    item.category.push(channel.slug);
                }
                item.content = data.content.filter((item) => item.innerHtml !== undefined && item.innerHtml !== '');
                item.caption = data.dek;

                if (data.leadArt) {
                    item.imgUrl = data.leadArt.image?.url;
                    item.imgAlt = data.leadArt.image?.altText;
                    item.imgCaption = data.leadArt.image?.attributionText;
                }

                item.description = renderToString(
                    <div>
                        {item.caption ? raw(item.caption) : null}
                        <br />
                        {item.imgUrl ? (
                            <figure>
                                <img src={item.imgUrl} alt={item.imgAlt ?? ''} />
                                <figcaption>{item.imgCaption}</figcaption>
                            </figure>
                        ) : null}
                        {item.content.map((contentItem) => (
                            <>
                                {raw(contentItem.innerHtml)}
                                {contentItem.tagName ? null : (
                                    <>
                                        <br />
                                        <br />
                                    </>
                                )}
                            </>
                        ))}
                    </div>
                );
                return {
                    title: item.title,
                    pubDate: parseDate(item.pubDate),
                    link: item.link,
                    description: item.description,
                };
            })
        )
    );
    return list;
};

export { getArticleDetails };
