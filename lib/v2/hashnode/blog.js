const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');

const baseApiUrl = 'https://api.hashnode.com';

module.exports = async (ctx) => {
    const username = ctx.params.username;
    if (!username) {
        return;
    }

    const query = `
    {
        user(username: "${username}") {
            publication {
                posts{
                    slug
                    title
                    brief
                    coverImage
                    dateAdded
                }
            }
        }
    }
    `;

    const userUrl = `https://${username}.hashnode.dev`;
    const response = await got({
        method: 'POST',
        url: baseApiUrl,
        headers: {
            Referer: userUrl,
            'Content-type': 'application/json',
        },
        body: JSON.stringify({ query }),
    });

    const publication = response.data.data.user.publication;
    if (!publication) {
        return;
    }

    const list = publication.posts;
    ctx.state.data = {
        title: `Hashnode by ${username}`,
        link: userUrl,
        item: list
            .map((item) => ({
                title: item.title,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    image: item.coverImage,
                    brief: item.brief,
                }),
                pubDate: parseDate(item.dateAdded),
                link: `${userUrl}/${item.slug}`,
            }))
            .filter((item) => item !== ''),
    };
};
