import { Route } from '@/types';

import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/newsroom/:category?/:region?',
    categories: ['new-media'],
    example: '/netflix/newsroom',
    parameters: {
        category: {
            description: 'Category',
            default: 'all',
            options: [
                { value: 'all', label: 'All News' },
                { value: 'business', label: 'Business' },
                { value: 'entertainment', label: 'Entertainment' },
                { value: 'product', label: 'Product' },
                { value: 'impact', label: 'Social Impact' },
            ],
        },
        region: {
            description: 'Region, can be found in the region URL',
            default: 'en',
            options: [
                { value: 'ar', label: 'اللغة العربية' },
                { value: 'de', label: 'Deutsch' },
                { value: 'el', label: 'Ελληνικά' },
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Español (LatAm)' },
                { value: 'es-es', label: 'Español (España)' },
                { value: 'fr', label: 'Français' },
                { value: 'id', label: 'Bahasa Indonesia' },
                { value: 'it', label: 'Italiano' },
                { value: 'ja', label: '日本語' },
                { value: 'ko', label: '한국어' },
                { value: 'pl', label: 'Polski' },
                { value: 'pt-br', label: 'Português (Brasil)' },
                { value: 'pt-pt', label: 'Português (Portugal)' },
                { value: 'ro', label: 'Română' },
                { value: 'ru', label: 'русский' },
                { value: 'th', label: 'ไทย' },
                { value: 'tr', label: 'Türkçe' },
                { value: 'vi', label: 'Tiếng Việt' },
                { value: 'zh-hans', label: '简体中文' },
                { value: 'zh-hant', label: '繁體中文' },
            ],
        },
    },
    radar: [
        {
            source: ['about.netflix.com/:region/newsroom', 'netflix.com'],
        },
    ],
    name: 'Newsroom',
    maintainers: ['nczitzk'],
    handler,
    url: 'about.netflix.com/',
};

const categories = {
    all: {
        title: 'All News',
        id: '0',
    },
    business: {
        title: 'Business',
        id: '1GnkLu7bxeOTxTRNCeu5qm',
    },
    entertainment: {
        title: 'Entertainment',
        id: '3SGbaxYYG5U05Z0G4piPV7',
    },
    product: {
        title: 'Product',
        id: '5TzuQELMABTu9jOPjXXlFU',
    },
    impact: {
        title: 'Social Impact',
        id: '2bUcGjE2800LAsk3JDurGA',
    },
};

const renderImage = ({ url, alt, caption }: { url: string; alt?: string; caption?: string }) => `<figure><img src="${url}" alt="${alt || ''}">${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;
const renderVideo = ({ url, poster, contentType }: { url: string; poster?: string; contentType: string }) =>
    `<video controls preload="metadata"${poster ? ` poster="${poster}"` : ''}><source src="${url}" type="${contentType}"></video>`;
const renderYoutube = (youtubeId) =>
    `<iframe id="ytplayer" type="text/html" width="640" height="360" src="https://www.youtube-nocookie.com/embed/${youtubeId}" frameborder="0" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;

const render = (node) => {
    if (!node) {
        return '';
    }
    switch (node.nodeType) {
        case 'document':
            return node.content?.map((c) => render(c)).join('') || '';
        case 'paragraph': {
            const innerHTML = node.content?.map((c) => render(c)).join('') || '';
            return `<p>${innerHTML}</p>`;
        }
        case 'heading-2': {
            const innerHTML = node.content?.map((c) => render(c)).join('') || '';
            return `<h2>${innerHTML}</h2>`;
        }
        case 'heading-3': {
            const innerHTML = node.content?.map((c) => render(c)).join('') || '';
            return `<h3>${innerHTML}</h3>`;
        }
        case 'heading-4': {
            const innerHTML = node.content?.map((c) => render(c)).join('') || '';
            return `<h4>${innerHTML}</h4>`;
        }
        case 'heading-6': {
            const innerHTML = node.content?.map((c) => render(c)).join('') || '';
            return `<h6>${innerHTML}</h6>`;
        }
        case 'hr':
            return '<hr>';
        case 'text': {
            let text = node.value || '';
            if (!node.marks || node.marks.length === 0) {
                return text;
            }
            for (const mark of node.marks) {
                switch (mark.type) {
                    case 'bold':
                        text = `<strong>${text}</strong>`;
                        break;
                    case 'italic':
                        text = `<em>${text}</em>`;
                        break;
                    case 'underline':
                        text = `<u>${text}</u>`;
                        break;
                    case 'strikethrough':
                        text = `<s>${text}</s>`;
                        break;
                    default:
                        throw new Error(`Unhandled mark type: ${mark.type}`);
                }
            }
            return text;
        }
        case 'hyperlink': {
            const href = node.data?.uri || '#';
            const innerHTML = node.content?.map((c) => render(c)).join('') || '';
            return `<a href="${href}" target="_blank" rel="noopener noreferrer">${innerHTML}</a>`;
        }

        case 'embedded-asset-block': {
            const file = Object.values(node.data?.file)[0];
            if (!file || !file.url) {
                return '';
            }

            const url = file.url.startsWith('//') ? 'https:' + file.url : file.url;
            const contentType = file.contentType || '';
            const title = Object.values(node.data?.title)[0] || '';
            if (contentType.startsWith('image/')) {
                return `<img src="${url}" alt="${title}">`;
            } else if (contentType.startsWith('video/')) {
                return renderVideo({ url, contentType });
            }
            return '';
        }
        case 'embedded-entry-block': {
            let innerHTML = '';
            if (node.data.display === 'carousel') {
                for (const img of node.data.images) {
                    const file = Object.values(img.file)[0];
                    const url = file.url.startsWith('//') ? 'https:' + file.url : file.url;

                    innerHTML += renderImage({
                        url,
                        alt: Object.values(img.title)[0],
                        caption: img.description ? Object.values(img.description)[0] : '',
                    });
                }
            }
            return innerHTML;
        }
        case 'embedded-entry-inline': {
            const embedLink = node.data.embedLink;
            if (embedLink.startsWith('https://www.youtube.com/') || embedLink.startsWith('https://youtu.be/')) {
                const youtubeId = node.data.embedLink.split('youtube.com/watch?v=')[1]?.split('&')[0] || node.data.embedLink.split('youtu.be/')[1]?.split('?')[0];
                return renderYoutube(youtubeId);
            }
            return `<a href="${embedLink}" target="_blank" rel="noopener noreferrer">${node.data.title ?? embedLink}</a>`;
        }

        case 'list-item': {
            const innerHTML = node.content?.map((c) => render(c)).join('') || '';
            return `<li>${innerHTML}</li>`;
        }
        case 'unordered-list': {
            const itemsHTML = node.content?.map((c) => render(c)).join('') || '';
            return `<ul>${itemsHTML}</ul>`;
        }
        case 'ordered-list': {
            const itemsHTML = node.content?.map((c) => render(c)).join('') || '';
            return `<ol>${itemsHTML}</ol>`;
        }

        default:
            throw new Error(`Unhandled node type: ${node.nodeType}`);
    }
};

async function handler(ctx) {
    const { category = 'all', region = 'en' } = ctx.req.param();

    const baseUrl = 'https://about.netflix.com';

    const response = await ofetch(`${baseUrl}/api/data/articles`, {
        query: {
            language: region,
            category: categories[category].id,
        },
    });

    const list = [...response.entities.region.regionArticles, ...response.entities.global.globalArticles].map((i) => ({
        title: i.title,
        link: `${baseUrl}/${region}/news/${i.slug}`,
        pubDate: parseDate(i.rawPublishedDate),
        category: [...new Set([...i.categories.map((category) => category.label), ...i.locations.map((location) => location.label)])],
        image: i.heroImage?.url ? `https:${i.heroImage.url.replace('?w=2560', '')}` : null,
        slug: i.slug,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch('https://about.netflix.com/api/data/entity', {
                    query: {
                        language: region,
                        entity: 'slug',
                        slug: item.slug,
                    },
                });

                const slug = response.entity.slug;
                item.description = '';
                if (slug.heroVideoUrl && !slug.heroVideoUrl.startsWith('https://www.youtube.com/')) {
                    item.description += renderVideo({
                        url: slug.heroVideoUrl,
                        poster: slug.heroImage?.url ? `https:${slug.heroImage.url.replace('?w=2560', '')}` : '',
                        contentType: 'video/mp4',
                    });
                } else if (slug.youtubeHero) {
                    item.description += renderYoutube(slug.youtubeHero.videoLink.split('youtube.com/watch?v=')[1]);
                } else if (slug.heroGallery?.length) {
                    for (const image of slug.heroGallery) {
                        item.description += renderImage({
                            url: `https:${image.url}`,
                            alt: image.alt,
                            caption: image.description || image.alt,
                        });
                    }
                } else {
                    item.description += renderImage({
                        url: `https:${slug.heroImage.url.replace('?w=2560', '')}`,
                        alt: slug.heroImage.alt,
                        caption: slug.heroImage.description || slug.heroImage.alt,
                    });
                }
                item.description += render(slug.body);

                return item;
            })
        )
    );

    return {
        title: `${categories[category].title} - Newsroom - Netflix`,
        link: `${baseUrl}/${region}/newsroom`,
        image: `${baseUrl}/favicon.ico`,
        item: items,
    };
}
