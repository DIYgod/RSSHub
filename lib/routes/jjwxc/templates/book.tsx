import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type BookDescriptionProps = {
    description?: string;
    chapterId?: string;
    chapterName?: string;
    chapterIntro?: string;
    chapterUrl?: string;
    chapterWords?: string;
    chapterClicks?: string;
    chapterUpdatedTime?: string;
};

export const renderBookDescription = ({ description, chapterId, chapterName, chapterIntro, chapterUrl, chapterWords, chapterClicks, chapterUpdatedTime }: BookDescriptionProps): string =>
    renderToString(
        description ? (
            <>{raw(description)}</>
        ) : (
            <table>
                <tbody>
                    {chapterId ? (
                        <tr>
                            <th>章节</th>
                            <td>
                                <a href={chapterUrl}>{chapterId}</a>
                            </td>
                        </tr>
                    ) : null}
                    {chapterName ? (
                        <tr>
                            <th>标题</th>
                            <td>
                                <a href={chapterUrl}>{chapterName}</a>
                            </td>
                        </tr>
                    ) : null}
                    {chapterIntro ? (
                        <tr>
                            <th>内容提要</th>
                            <td>
                                <a href={chapterUrl}>{chapterIntro}</a>
                            </td>
                        </tr>
                    ) : null}
                    {chapterWords ? (
                        <tr>
                            <th>字数</th>
                            <td>{chapterWords}</td>
                        </tr>
                    ) : null}
                    {chapterClicks ? (
                        <tr>
                            <th>点击</th>
                            <td>{chapterClicks}</td>
                        </tr>
                    ) : null}
                    {chapterUpdatedTime ? (
                        <tr>
                            <th>更新时间</th>
                            <td>{chapterUpdatedTime}</td>
                        </tr>
                    ) : null}
                </tbody>
            </table>
        )
    );
