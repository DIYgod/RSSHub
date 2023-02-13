const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const md = require('markdown-it')({
    linkify: true,
});
const { art } = require('@/utils/render');
const path = require('path');

const baseUrl = 'https://www.gq.com.tw';
const parsePreloadedStateJSON = ($) =>
    JSON.parse(
        $('script[type="text/javascript"]')
            .text()
            .match(/window\.__PRELOADED_STATE__ = ({.*?});/)[1]
    );
const largestImage = (sources, id) => {
    if (!id) {
        let maxWidth = 0;
        let maxUrl = '';
        Object.values(sources).forEach((size) => {
            if (size.width > maxWidth) {
                maxWidth = size.width;
                maxUrl = size.url;
            }
        });
        return maxUrl;
    }
    const url = sources[Object.keys(sources)[0]].url;
    const filename = url.substring(url.lastIndexOf('/') + 1);
    return `https://media.gq.com.tw/photos/${id}/${filename}`;
};

module.exports = async (ctx) => {
    const { caty, subcaty } = ctx.params;
    const link = `${baseUrl}${caty ? `/${caty}` : ''}${subcaty ? `/${subcaty}` : ''}`;
    const { data: response } = await got(link);
    const $ = cheerio.load(response);
    const { transformed } = parsePreloadedStateJSON($);

    const list = transformed.bundle.containers
        .filter((item) => item.items)
        .map((item) =>
            item.items.map((item) => ({
                title: item.source?.hed || item.dangerousHed,
                description: item.source?.dek || item.dangerousDek,
                link: (item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`).split('#intcid')[0],
                pubDate: parseDate(item.pubDate),
                author: item.contributors.author.items.map((item) => item.name).join(', '),
            }))
        )
        .flat();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);
                const data = JSON.parse($('script[type="application/ld+json"]').first().text());
                const { transformed } = parsePreloadedStateJSON($);
                const VideoObject = data['@type'] === 'VideoObject' ? true : false;
                const lede = !VideoObject ? transformed.article.headerProps.lede : null;

                let articleBody = '';
                if (!VideoObject) {
                    // typical article
                    // articleBody inludes non standard markdown syntax
                    articleBody = cheerio.load(md.render(data.articleBody.replace(/\{: target="_blank"\}/g, '')).replace(/\{: #link\}/g, ''), null, false);
                    articleBody('a').each((_, item) => {
                        item = $(item);
                        if (item.text().startsWith('#video:')) {
                            if (item.text().match(/youtube/)) {
                                const videoId = item.text().match(/.*https:\/\/www\.youtube\.com\/embed\/(.*)\s/)[1];
                                item.replaceWith(art(path.join(__dirname, '../templates/youtube.art'), { videoId }));
                            }
                        }
                        if (item.text().startsWith('![#image:')) {
                            const imageId = item.text().match(/!\[#image: \/photos\/(.*?)\]/)[1];
                            const imgInfo = transformed.article.lightboxImages.find((item) => item.id === imageId);
                            item.html(
                                art(path.join(__dirname, '../templates/img.art'), {
                                    src: largestImage(imgInfo.sources, imageId),
                                    alt: imgInfo.dangerousCaption,
                                })
                            );
                        }
                    });
                    articleBody('p').each((_, item) => {
                        item = $(item);
                        if (item.text().startsWith('+++')) {
                            item.remove();
                        }
                        if (item.text().startsWith('[#image:')) {
                            const imageId = item.text().match(/\[#image: \/photos\/(.*?)\]/)[1];
                            const imgInfo = transformed.article.lightboxImages.find((item) => item.id === imageId);
                            item.replaceWith(
                                art(path.join(__dirname, '../templates/img.art'), {
                                    src: largestImage(imgInfo.sources, imageId),
                                    alt: imgInfo.dangerousCaption,
                                })
                            );
                        }
                        if (item.text().startsWith('[#article:')) {
                            const articleId = item.text().match(/\[#article: \/articles\/(.*?)\]/)[1];
                            const articleProps = transformed.article.body.filter((i) => i[0] === 'inline-embed').find((i) => i[1].ref === articleId)[1].props;
                            item.replaceWith(
                                art(path.join(__dirname, '../templates/embed-article.art'), {
                                    url: `${baseUrl}${articleProps.url}`,
                                    text: articleProps.dangerousHed,
                                })
                            );
                        }
                        if (item.text().startsWith('[#product:')) {
                            const productId = item.text().match(/\[#product: \/products\/(.*?)\]/)[1];
                            const productProps = transformed.article.body.filter((i) => i[0] === 'inline-embed').find((i) => i[1].ref === productId)[1].props;
                            item.replaceWith(
                                art(path.join(__dirname, '../templates/embed-product.art'), {
                                    img: art(path.join(__dirname, '../templates/img.art'), {
                                        src: largestImage(productProps.image.sources),
                                    }),
                                    productProps,
                                })
                            );
                        }
                        if (item.text().startsWith('[#instagram:')) {
                            const instagramHref = item.text().match(/\[#instagram: (.*?)\]/)[1];
                            item.replaceWith(
                                art(path.join(__dirname, '../templates/embed-article.art'), {
                                    url: instagramHref,
                                    text: instagramHref,
                                })
                            );
                        }
                    });
                    item.description = art(path.join(__dirname, '../templates/tw.art'), {
                        dangerousDek: transformed.article.headerProps.dangerousDek, // quote
                        lede: art(path.join(__dirname, '../templates/img.art'), {
                            // header image
                            src: lede?.sources ? largestImage(lede.sources, lede.id) : null,
                            alt: lede?.caption,
                        }),
                        articleBody: articleBody.html(),
                    });
                } else {
                    // is VideoObject
                    item.description = art(path.join(__dirname, '../templates/videoObject.art'), {
                        poster: transformed.video.metaImageUrl,
                        sources: transformed.video.sources,
                        articleBody: data.description,
                    });
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${transformed.coreDataLayer.content.contentTitle} | ${transformed.coreDataLayer.content.brand}`,
        link,
        image: `${baseUrl}${transformed.logo.sources.sm.url}`,
        item: items,
        allowEmpty: true,
    };
};
