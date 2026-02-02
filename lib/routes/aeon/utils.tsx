import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const ENDPOINT = 'https://api.aeonmedia.co/graphql';

const ESSAY = /* GraphQL */ `
query getAeonEssay($slug: String!) {
    essay(slug: $slug) {
        publishedAt
        updatedAt
        authors { name authorBio }
        audioUrl
        image { url alt caption }
        body
    }
}`;

const VIDEO = /* GraphQL */ `
query getAeonVideo($slug: String!, $site: SiteEnum!) {
    video(slug: $slug, site: $site) {
        publishedAt
        updatedAt
        authors { name authorBio }
        hoster
        hosterId
        credits
        description
    }
}`;

const renderVideoDescription = (article) => {
    let video = article.hosterId;

    if (article.hoster === 'vimeo') {
        video = `https://player.vimeo.com/video/${video}?dnt=1`;
    } else if (article.hoster === 'youtube') {
        video = `https://www.youtube-nocookie.com/embed/${video}`;
    }

    return renderToString(
        <>
            <iframe width="672" height="377" src={video} frameborder="0" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
            {article.credits ? raw(article.credits) : null}
            {article.description ? raw(article.description) : null}
        </>
    );
};

const renderEssayDescription = ({ banner, authorsBio, content }) =>
    renderToString(
        <>
            {banner?.url ? (
                <figure>
                    <img src={banner.url} alt={banner.alt} />
                    {banner.caption ? <figcaption>{raw(banner.caption)}</figcaption> : null}
                </figure>
            ) : null}
            {authorsBio ? raw(authorsBio) : null}
            {content ? raw(content) : null}
        </>
    );

const getJSON = (slug, site) => {
    const query = site ? VIDEO : ESSAY;
    const variables = site ? { slug, site } : { slug };
    const operationName = site ? 'getAeonVideo' : 'getAeonEssay';
    return ofetch(ENDPOINT, {
        method: 'POST',
        body: {
            operationName,
            query,
            variables,
        },
    });
};

export const getData = async (list) => {
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const res = await getJSON(item.slug, item.type === 'video' ? 'aeon' : null);

                const data = res.data[item.type];
                item.pubDate = parseDate(data.publishedAt);

                if (item.type === 'video') {
                    item.description = renderVideoDescription(data);
                } else {
                    if (data.audioUrl) {
                        delete item.image;
                        item.enclosure_url = data.audioUrl;
                        item.enclosure_type = 'audio/mpeg';
                    }

                    const capture = load(data.body, null, false);
                    const banner = data.image;
                    capture('p.pullquote').remove();

                    const authorsBio = renderToString(
                        <>
                            <hr />
                            {data.authors.map((author) => (
                                <p>
                                    {author.name}
                                    {raw(author.authorBio.replaceAll(/^<p>/g, ' '))}
                                </p>
                            ))}
                            <hr />
                            <br />
                        </>
                    );

                    item.description = renderEssayDescription({ banner, authorsBio, content: capture.html() });
                }

                return item;
            })
        )
    );

    return items;
};
