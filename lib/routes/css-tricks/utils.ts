import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import { DataItem } from '@/types';
import { parseDate } from '@/utils/parse-date';

export const rootUrl = 'https://css-tricks.com';
type Card = {
    id: string;
    title: string;
    link: string;
    thumbnail: string;
};

export async function extractMiniCards(cardselector: string, titleSelector: string = '', descSelector: string = '') {
    const response = await ofetch(rootUrl);
    const $ = load(response);
    const cards = $(cardselector).toArray();
    const title = titleSelector ? $(titleSelector).text().trim() : '';
    const description = descSelector ? $(descSelector).text().trim() : '';
    return {
        title,
        description,
        cards,
    };
}

function extractCardsInfo(cards) {
    return cards.map((card) => {
        const $ = load(card);
        const id = $(card).attr('id');
        const thumbnail = $(card).find('div.article-thumbnail-wrap > a >img').attr('src');
        const article = $('div.article-article');
        const title = article.find('h2 > a').text();
        const link = article.find('h2 > a').attr('href');
        return {
            id,
            title,
            link,
            thumbnail,
        } as Card;
    });
}

function extractMiniCardsInfo(cards) {
    return cards.map((card) => {
        const $ = load(card);
        const id = $(card).attr('id')?.replace('mini-', '');
        const thumbnail = '';
        const title = $('h3.mini-card-title').find('a:not(.aal_anchor)').text();
        const link = $('h3.mini-card-title').find('a:not(.aal_anchor)').attr('href');
        return {
            id,
            title,
            link,
            thumbnail,
        } as Card;
    });
}

export async function processWithWp(cards, mini: boolean = false, type: string = 'posts') {
    const cardsWithInfo = mini ? extractMiniCardsInfo(cards) : extractCardsInfo(cards);
    const ids = cardsWithInfo.map((card: Card) => card.id.replace('post-', ''));
    const allPosts = await ofetch(`${rootUrl}/wp-json/wp/v2/${type}?include=${ids.join(',')}&_embed&per_page=${ids.length}`);
    // To maintain the ID/post Order
    const idMappedPost = Object.fromEntries(allPosts.map((post) => [post.id, post]));
    return ids.map((id) => extractPostDetails(idMappedPost[id]));
}

function extractPostDetails(data) {
    const title = data.title.rendered;
    const link = data.link;
    const content = data.content.rendered;
    const summary = data.excerpt.rendered;
    const date = data.date_gmt;
    const updateDate = data.modified_gmt;
    const author = data._embedded?.author;
    const authorName = author?.[0]?.name;
    const authorUrl = author?.[0]?.link;
    const authorAvatar = author?.[0]?.avatar_urls['48'];
    const thumbnail = data._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    const tags = data._embedded?.['wp:term']?.[1]?.map((tag) => tag.name);
    return {
        title,
        link,
        description: content,
        banner: thumbnail,
        image: thumbnail,
        pubDate: parseDate(date),
        updated: parseDate(updateDate),
        author: [
            {
                name: authorName || '',
                url: authorUrl || '',
                avatar: authorAvatar || '',
            },
        ],
        content: {
            html: content,
            text: summary,
        },
        category: tags,
    } as DataItem;
}
