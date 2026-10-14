import { FetchError } from 'ofetch';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { getPublicUser } from './utils';

export const route: Route = {
    path: '/user/:username',
    name: 'Userpage',
    url: 'furaffinity.net',
    categories: ['social-media'],
    example: '/furaffinity/user/fender',
    maintainers: ['TigerCubDen', 'SkyNetX007'],
    parameters: { username: 'Username, can find in userpage' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['furaffinity.net/user/:username'],
            target: '/user/:username',
        },
    ],
    handler,
};

async function handler(ctx) {
    const { username } = ctx.req.param();
    const url = `https://faexport.spangle.org.uk/user/${username}.json`;

    let data;
    try {
        data = await ofetch(url, {
            method: 'GET',
            headers: {
                Referer: 'https://faexport.spangle.org.uk/',
            },
        });
    } catch (error) {
        if (!(error instanceof FetchError) || !error.statusCode || error.statusCode < 500) {
            throw error;
        }
        const profile = await getPublicUser(username);
        const link = `https://www.furaffinity.net/user/${username}`;
        return {
            title: `Fur Affinity | Userpage of ${profile.name}`,
            link,
            description: `Fur Affinity User Profile of ${profile.name}`,
            item: [{ title: `${profile.name}'s User Profile`, link, description: profile.description }],
        };
    }

    // Collect the source profile fields.
    const name = data.name;
    const profile = data.profile;
    const accountType = data.account_type;
    const avatar = `<img src="${data.avatar}">`;
    const fullName = data.full_name;
    const artistType = data.artist_type;
    const userTitle = data.user_title;
    const registeredSince = data.registered_since;
    const currentMood = data.current_mood;
    const artistProfile = data.artist_profile;
    const pageviews = data.pageviews;
    const submissions = data.submissions;
    const commentsReceived = data.comments_received;
    const commentsGiven = data.comments_given;
    const journals = data.journals;
    const favorite = data.favorites;
    const watchersCount = data.watchers.count;
    const watchingCount = data.watching.count;

    const artistInformation = data.artist_information;
    const species = artistInformation.Species;
    const personalQuote = artistInformation['Personal Quote'];
    const musicTypeGenre = artistInformation['Music Type/Genre'];
    const favoritesMovie = artistInformation['Favorite Movie'];
    const favoritesGame = artistInformation['Favorite Game'];
    const favoritesGamePlatform = artistInformation['Favorite Game Platform'];
    const favoritesArtist = artistInformation['Favorite Artist'];
    const favoritesAnimal = artistInformation['Favorite Animal'];
    const favoritesWebsite = artistInformation['Favorite Website'];
    const favoritesFood = artistInformation['Favorite Food'];

    const contactInformation = data.contact_information;
    let contactResult = 'none <br> <br> ';
    // Render each source contact record.
    if (contactInformation) {
        contactResult = '';
        for (const element of contactInformation) {
            for (const x in element) {
                switch (x) {
                    case 'title':
                        contactResult += `Title: ${element[x]} <br> `;
                        break;
                    case 'name':
                        contactResult += `Name: ${element[x]} <br> `;
                        break;
                    case 'link':
                        contactResult += `Link: ${element[x]} <br> `;
                        break;
                    default:
                        throw new Error(`Unknown type: ${x}`);
                }
            }
            contactResult += '<br> ';
        }
    }

    const description = `Name: ${name} <br> Profile: ${profile} <br> Account Type: ${accountType} <br>
    Avatar: ${avatar} <br> Full Name: ${fullName} <br> Artist Type: ${artistType} <br> User Title: ${userTitle} <br>
    Registered Since: ${registeredSince} <br> Current Mood: ${currentMood} <br> <br> Artist Profile: <br> ${artistProfile} <br> <br>
    Pageviews: ${pageviews} <br> Submissions: ${submissions} <br> Comments_Received: ${commentsReceived} <br> Comments Given: ${commentsGiven} <br>
    Journals: ${journals} <br> Favorite: ${favorite} <br> <br> Artist Information: <br> Species: ${species} <br> Personal Quote: ${personalQuote} <br> Music Type/Genre: ${musicTypeGenre} <br>
    Favorite Movie: ${favoritesMovie} <br> Favorite Game: ${favoritesGame} <br> Favorite Game Platform: ${favoritesGamePlatform} <br> Favorite Artist: ${favoritesArtist} <br>
    Favorite Animal: ${favoritesAnimal} <br> Favorite Website: ${favoritesWebsite} <br> Favorite Food: ${favoritesFood} <br> <br> Contact Information: <br> ${contactResult}
    Watchers Count: ${watchersCount} <br> Watching Count: ${watchingCount} `;

    const items: Array<{ title: string; link: string; description: string }> = [
        {
            title: `${data.name}'s User Profile`,
            link: `https://www.furaffinity.net/user/${username}`,
            description,
        },
    ];

    return {
        title: `Fur Affinity | Userpage of ${data.name}`,
        link: `https://www.furaffinity.net/user/${username}`,
        description: `Fur Affinity User Profile of ${data.name}`,
        item: items,
    };
}
