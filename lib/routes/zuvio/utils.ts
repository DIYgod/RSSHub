import path from 'node:path';

import got from '@/utils/got';
import { art } from '@/utils/render';

const token =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0OTcyMzI1MjMsInN5c3RlbV9uYW1lIjoiZm9ydW0iLCJ6dXZpb19pZCI6LTk5OSwiZW1haWwiOm51bGwsIm5hbWUiOm51bGwsInVuaXZlcnNpdHlfaWQiOm51bGwsInVuaXZlcnNpdHlfbmFtZSI6bnVsbH0.0KoJiSnyazsJxLCNEnqnuNUdKsJFhBdCn3R2BJpoUtk';
const apiUrl = 'https://forum.zuvio.com.tw/api';
const rootUrl = 'https://irs.zuvio.com.tw/student5/chickenM';

const renderDesc = (data) => {
    let output = '';
    if (data.ref_article) {
        output += art(path.join(__dirname, 'templates/ref_article.art'), {
            ref_article: data.ref_article,
        });
    }
    output += renderSections(data.sections);
    return output;
};

const renderSections = (sections) => {
    let output = '';
    for (const section of sections) {
        switch (section.type) {
            case 'text':
                output += section.content.replaceAll('\n', '<br>');

                break;

            case 'img':
                output += art(path.join(__dirname, 'templates/img.art'), { section });

                break;

            case 'youtube':
                output += art(path.join(__dirname, 'templates/youtube.art'), { section });

                break;

            case 'link':
                output += art(path.join(__dirname, 'templates/link.art'), { section });

                break;

            default:
                throw new Error(`Unknown section type: ${section.type}`);
        }
    }
    return output;
};

const getBoards = (tryGet) =>
    tryGet('zuvio:boards', async () => {
        const { data } = await got(`${apiUrl}/board`, {
            searchParams: {
                api_token: token,
                user_id: '0',
            },
        });

        return data.map((item) => ({
            title: item.name,
            description: art(path.join(__dirname, 'templates/rss.art'), { id: item.id }),
            boardId: item.id,
            link: `${rootUrl}/articles/${item.id}`,
        }));
    });

export { apiUrl, getBoards, renderDesc, renderSections, rootUrl, token };
