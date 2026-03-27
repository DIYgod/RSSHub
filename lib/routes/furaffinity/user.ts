import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/user/:username',
    name: 'Userpage',
    url: 'furaffinity.net',
    categories: ['social-media'],
    example: '/furaffinity/user/fender/nsfw',
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

    const data = await ofetch(url, {
        method: 'GET',
        headers: {
            Referer: 'https://faexport.spangle.org.uk/',
        },
    });

    // 收集传入的数据
    const name = data.name;
    const profile = data.profile;
    const account_type = data.profile;
    const avatar = `<img src="${data.avatar}">`;
    const full_name = data.full_name;
    const artist_type = data.artist_type;
    const user_title = data.user_title;
    const registered_since = data.registered_since;
    const current_mood = data.current_mood;
    const artist_profile = data.artist_profile;
    const pageviews = data.pageviews;
    const submissions = data.submissions;
    const comments_received = data.comments_received;
    const comments_given = data.comments_given;
    const journals = data.journals;
    const favorite = data.favorites;
    const watchers_count = data.watchers.count;
    const watching_count = data.watching.count;

    const artist_information = data.artist_information;
    const species = artist_information.Species;
    const personal_quote = artist_information['Personal Quote'];
    const music_type_genre = artist_information['Music Type/Genre'];
    const favorites_movie = artist_information['Favorite Movie'];
    const favorites_game = artist_information['Favorite Game'];
    const favorites_game_platform = artist_information['Favorite Game Platform'];
    const favorites_artist = artist_information['Favorite Artist'];
    const favorites_animal = artist_information['Favorite Animal'];
    const favorites_website = artist_information['Favorite Website'];
    const favorites_food = artist_information['Favorite Food'];

    const contact_information = data.contact_information;
    let contact_result = 'none <br> <br> ';
    // 对一个或多个用户联系方式进行遍历
    if (contact_information) {
        contact_result = '';
        for (const element of contact_information) {
            for (const x in element) {
                switch (x) {
                    case 'title':
                        contact_result += `Title: ${element[x]} <br> `;
                        break;
                    case 'name':
                        contact_result += `Name: ${element[x]} <br> `;
                        break;
                    case 'link':
                        contact_result += `Link: ${element[x]} <br> `;
                        break;
                    default:
                        throw new Error(`Unknown type: ${x}`);
                }
            }
            contact_result += `<br> `;
        }
    }

    const description = `Name: ${name} <br> Profile: ${profile} <br> Account Type: ${account_type} <br>
    Avatar: ${avatar} <br> Full Name: ${full_name} <br> Artist Type: ${artist_type} <br> User Title: ${user_title} <br>
    Registered Since: ${registered_since} <br> Current Mood: ${current_mood} <br> <br> Artist Profile: <br> ${artist_profile} <br> <br>
    Pageviews: ${pageviews} <br> Submissions: ${submissions} <br> Comments_Received: ${comments_received} <br> Comments Given: ${comments_given} <br>
    Journals: ${journals} <br> Favorite: ${favorite} <br> <br> Artist Information: <br> Species: ${species} <br> Personal Quote: ${personal_quote} <br> Music Type/Genre: ${music_type_genre} <br>
    Favorite Movie: ${favorites_movie} <br> Favorite Game: ${favorites_game} <br> Favorite Game Platform: ${favorites_game_platform} <br> Favorite Artist: ${favorites_artist} <br>
    Favorite Animal: ${favorites_animal} <br> Favorite Website: ${favorites_website} <br> Favorite Food: ${favorites_food} <br> <br> Contact Information: <br> ${contact_result}
    Watchers Count: ${watchers_count} <br> Watching Count: ${watching_count} `;

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
