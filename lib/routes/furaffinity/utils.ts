import { load } from 'cheerio';
import { FetchError } from 'ofetch';

import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface Comment {
    id: string;
    name: string;
    avatar?: string;
    text: string;
    posted_at?: string;
}

interface CommentFeed {
    title: string;
    name: string;
    comments: Comment[];
}

interface Journal {
    id: string;
    title: string;
    link: string;
    description: string;
    posted_at?: string;
}

interface Artwork {
    id: string;
    title: string;
    link: string;
    thumbnail: string;
    name: string;
}

interface Commission {
    title: string;
    description: string;
    submission: {
        id?: string;
        link: string;
        thumbnail?: string;
    };
}

const gallerySelectors = {
    artwork: '#gallery-frontpage-submissions',
    writing: '#gallery-frontpage-writing',
    music: '#gallery-frontpage-music',
    crafts: '#gallery-frontpage-crafts',
} satisfies Record<string, string>;

const isGalleryCategory = (key: string): key is keyof typeof gallerySelectors => Object.hasOwn(gallerySelectors, key);

export async function getCommissions(username: string): Promise<Commission[]> {
    try {
        return await ofetch<Commission[]>(`https://faexport.spangle.org.uk/user/${username}/commissions.json?full=1`, { headers: { Referer: 'https://faexport.spangle.org.uk/' } });
    } catch (error) {
        if (!(error instanceof FetchError) || !error.statusCode || error.statusCode < 500) {
            throw error;
        }
        const link = `https://www.furaffinity.net/commissions/${username}/`;
        const html = await ofetch(link, { responseType: 'text' });
        const $ = load(html);
        if ($('#no-images').length) {
            return [];
        }
        if (!$('.types-table').length) {
            throw new Error(`Fur Affinity did not return public commission types for ${username}.`, { cause: error });
        }
        return $('.types-table > tbody > tr')
            .toArray()
            .map((element): Commission => {
                const commission = $(element);
                const title = commission.find('.desc h4').first().text();
                if (!title) {
                    throw new Error(`Fur Affinity returned a commission type without its name on ${link}.`, { cause: error });
                }
                const preview = commission.find('.preview');
                const permalink = preview.find('a[href]').first().attr('href');
                const thumbnail = preview.find('img').first().attr('src');
                return {
                    title,
                    description: `${commission.find('.desc').html() ?? ''}${commission.find('.info').html() ?? ''}`,
                    submission: {
                        id: preview.find('b[id^="sid_"]').attr('id')?.slice(4),
                        link: permalink ? new URL(permalink, link).href : link,
                        thumbnail: thumbnail ? new URL(thumbnail, link).href : undefined,
                    },
                };
            });
    }
}

export async function getPublicUser(username: string): Promise<{ name: string; description: string }> {
    const link = `https://www.furaffinity.net/user/${username}/`;
    const html = await ofetch(link, { responseType: 'text' });
    const $ = load(html);
    const name = $('userpage-nav-user-details .js-displayName').first().text();
    const profile = $('.userpage-profile').first();
    if (!name || !profile.length) {
        throw new Error(`Fur Affinity did not return a public user profile for ${username}.`);
    }
    const sections = $('.userpage-right-column').filter((_, element) => ['Stats', 'User Profile', 'Contact Information'].includes($(element).find('.section-header h2').first().text().trim()));
    const watchCounts = $('.watched-by-block .section-header, .is-watching-block .section-header');
    return {
        name,
        description: `${$('userpage-nav-avatar').html() ?? ''}${$('userpage-nav-user-details .user-title').html() ?? ''}${profile.html() ?? ''}${sections
            .toArray()
            .map((element) => $(element).html() ?? '')
            .join('')}${watchCounts
            .toArray()
            .map((element) => $(element).html() ?? '')
            .join('')}`,
    };
}

export async function getWatchList(username: string, direction: 'to' | 'by'): Promise<{ users: Array<{ name: string; link: string; guid: string }>; count?: number }> {
    // FAExport provides display names without the corresponding profile permalinks.
    const link = `https://www.furaffinity.net/watchlist/${direction}/${username}/`;
    const [html, profileHtml] = await Promise.all([ofetch(link, { responseType: 'text' }), ofetch(`https://www.furaffinity.net/user/${username}/`, { responseType: 'text' })]);
    const $ = load(html);
    const profile = load(profileHtml);
    if (!$('.watch-list').length) {
        throw new Error(`Fur Affinity did not return a public watch list for ${username}.`);
    }
    const nativeCount = profile(direction === 'to' ? '.watched-by-block .section-header' : '.is-watching-block .section-header')
        .text()
        .match(/(?:Watched by|Watching) (\d+)/)?.[1];
    return {
        users: $('.watch-list-items a[href^="/user/"]')
            .toArray()
            .map((element) => {
                const anchor = $(element);
                const href = anchor.attr('href')!;
                return { name: anchor.text(), link: new URL(href, link).href, guid: href.split('/', 3)[2] };
            }),
        count: nativeCount ? Number(nativeCount) : undefined,
    };
}

export async function getArtwork(apiUrl: string, link: string, mode: string, category?: string): Promise<Artwork[]> {
    try {
        const data = await ofetch<Artwork[] | Record<string, Artwork[]>>(apiUrl, { headers: { Referer: 'https://faexport.spangle.org.uk/' } });
        return Array.isArray(data) ? data : data[category!];
    } catch (error) {
        if (!(error instanceof FetchError) || !error.statusCode || error.statusCode < 500 || mode !== 'sfw') {
            throw error;
        }
        const html = await ofetch(link, { responseType: 'text' });
        const $ = load(html);
        const gallery = category ? $(isGalleryCategory(category) ? gallerySelectors[category] : undefined) : $.root();
        return gallery
            .find('figure[id^="sid-"].r-general')
            .toArray()
            .map((element): Artwork => {
                const artwork = $(element);
                const id = artwork.attr('id')!.slice(4);
                const anchor = artwork.find('figcaption a[href^="/view/"]').first();
                const author = artwork.find('figcaption a[href^="/user/"]').first();
                const thumbnail = artwork.find('img').first().attr('src');
                const permalink = anchor.attr('href');
                if (!permalink || !thumbnail || !author.attr('href')) {
                    throw new Error(`Fur Affinity returned public artwork without its permalink, thumbnail, or artist on ${link}.`, { cause: error });
                }
                return {
                    id,
                    title: anchor.attr('title') ?? anchor.text(),
                    link: new URL(permalink, link).href,
                    thumbnail: new URL(thumbnail, link).href,
                    name: author.text(),
                };
            });
    }
}

export async function getJournals(username: string): Promise<Journal[]> {
    try {
        return await ofetch<Journal[]>(`https://faexport.spangle.org.uk/user/${username}/journals.json?full=1`, { headers: { Referer: 'https://faexport.spangle.org.uk/' } });
    } catch (error) {
        if (!(error instanceof FetchError) || !error.statusCode || error.statusCode < 500) {
            throw error;
        }
        const link = `https://www.furaffinity.net/journals/${username}/`;
        const html = await ofetch(link, { responseType: 'text' });
        const $ = load(html);
        return $('section[id^="jid:"]')
            .toArray()
            .map((element): Journal => {
                const journal = $(element);
                const id = journal.attr('id')!.slice(4);
                const timestamp = Number(journal.find('.section-header .popup_date').first().attr('data-time'));
                const permalink = journal.find(`.section-footer a[href="/journal/${id}/"]`).attr('href');
                if (!permalink) {
                    throw new Error(`Fur Affinity returned a journal without its permalink on ${link}.`, { cause: error });
                }
                return {
                    id,
                    title: journal.find('.section-header h2').text(),
                    link: new URL(permalink, link).href,
                    description: journal.find('.section-body .journal-body').html() ?? '',
                    posted_at: Number.isFinite(timestamp) && timestamp > 0 ? parseDate(timestamp * 1000).toISOString() : undefined,
                };
            });
    }
}

export async function getComments(kind: 'journal' | 'submission', id: string): Promise<CommentFeed> {
    const apiUrl = `https://faexport.spangle.org.uk/${kind}/${id}`;
    try {
        const metadata = await ofetch<{ title: string; name: string }>(`${apiUrl}.json`, { headers: { Referer: 'https://faexport.spangle.org.uk/' } });
        const comments = await ofetch<Comment[]>(`${apiUrl}/comments.json`, { headers: { Referer: 'https://faexport.spangle.org.uk/' } });
        return { ...metadata, comments };
    } catch (error) {
        if (!(error instanceof FetchError) || !error.statusCode || error.statusCode < 500) {
            throw error;
        }
        const link = `https://www.furaffinity.net/${kind === 'submission' ? 'view' : 'journal'}/${id}/`;
        const html = await ofetch(link, { responseType: 'text' });
        const $ = load(html);
        const title = kind === 'journal' ? $('#c-journalTitleTop__subject').text() : $('.submission-title h2').text();
        const owner = $('userpage-nav-avatar a').attr('href') ?? $('.submission-title').parent().find('a[href^="/user/"]').first().attr('href');
        const name = owner?.split('/', 3)[2];
        if (!title || !name) {
            throw new Error(`Fur Affinity did not return public ${kind} metadata for ${link}.`, { cause: error });
        }
        const comments = $('.comments-list .comment_container[data-timestamp]')
            .toArray()
            .map((element): Comment => {
                const comment = $(element);
                const anchor = comment.find('.comment_anchor').attr('id');
                const author = comment.find('.c-usernameBlock__userName').attr('href')?.split('/', 3)[2];
                if (!anchor?.startsWith('cid:') || !author) {
                    throw new Error(`Fur Affinity returned a comment without its ID or author on ${link}.`, { cause: error });
                }
                const timestamp = Number(comment.attr('data-timestamp'));
                return {
                    id: anchor.slice(4),
                    name: author,
                    avatar: comment.find('.comment_useravatar').attr('src'),
                    text: comment.find('.comment_text').html() ?? '',
                    posted_at: Number.isFinite(timestamp) && timestamp > 0 ? parseDate(timestamp * 1000).toISOString() : undefined,
                };
            });
        return { title, name, comments };
    }
}
