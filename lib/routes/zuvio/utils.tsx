import { renderToString } from 'hono/jsx/dom/server';

import got from '@/utils/got';

const token =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0OTcyMzI1MjMsInN5c3RlbV9uYW1lIjoiZm9ydW0iLCJ6dXZpb19pZCI6LTk5OSwiZW1haWwiOm51bGwsIm5hbWUiOm51bGwsInVuaXZlcnNpdHlfaWQiOm51bGwsInVuaXZlcnNpdHlfbmFtZSI6bnVsbH0.0KoJiSnyazsJxLCNEnqnuNUdKsJFhBdCn3R2BJpoUtk';
const apiUrl = 'https://forum.zuvio.com.tw/api';
const rootUrl = 'https://irs.zuvio.com.tw/student5/chickenM';

const renderDesc = (data) => {
    let output = '';
    if (data.ref_article) {
        output += renderRefArticle(data.ref_article);
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
                output += renderImageSection(section);

                break;

            case 'youtube':
                output += renderYouTubeSection(section);

                break;

            case 'link':
                output += renderLinkSection(section);

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
            description: renderBoardLink(item.id),
            boardId: item.id,
            link: `${rootUrl}/articles/${item.id}`,
        }));
    });

export { apiUrl, getBoards, renderDesc, renderSections, rootUrl, token };

const renderRefArticle = (ref_article): string =>
    renderToString(
        <>
            引用自：
            <a href={ref_article.id}>
                <img src={ref_article.user_icon} />
                <div>
                    {ref_article.university} {ref_article.user_name} {ref_article.board_name}
                </div>
                <div>{ref_article.title}</div>
                <div>{ref_article.abstract}</div>
            </a>
            <hr />
        </>
    );

const renderImageSection = (section): string =>
    renderToString(
        <>
            <img src={section.content} />
            <br />
        </>
    );

const renderYouTubeSection = (section): string =>
    renderToString(
        <>
            <iframe width="672" height="377" src={`https://www.youtube-nocookie.com/embed/${section.youtube_id}`} frameborder="0" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
            <br />
        </>
    );

const renderLinkSection = (section): string =>
    renderToString(
        <p>
            <a href={section.content}>
                <img src={section.icon} />
                <div>{section.title}</div>
                <div>{section.description}</div>
            </a>
        </p>
    );

const renderBoardLink = (id): string => renderToString(<a href={`https://rsshub.app/zuvio/student5/${id}`}>{id}</a>);
