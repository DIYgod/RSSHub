import { renderToString } from 'hono/jsx/dom/server';

import { formatDate, parseDate } from '@/utils/time';

type NewsItem = {
    url?: string;
    title?: string;
    siteNameDisplay?: string;
};

type TimelineTopic = {
    publishDate?: string;
    uid?: string;
    title?: string;
};

type TimelineData = {
    topics?: TimelineTopic[];
};

type DescriptionData = {
    description?: string;
    news?: NewsItem[];
    timeline?: TimelineData;
    rootUrl: string;
};

export const renderDescription = ({ description, news, timeline, rootUrl }: DescriptionData) =>
    renderToString(
        <>
            {description ? <p>{description}</p> : null}
            {news?.length ? (
                <>
                    <h3>媒体报道</h3>
                    <table cellspacing="8">
                        <tbody>
                            {news.map((item, index) => (
                                <tr key={String(item.url ?? item.title ?? index)}>
                                    <td>
                                        <a href={item.url}>{item.title}</a>
                                    </td>
                                    <th align="left">
                                        <small>{item.siteNameDisplay}</small>
                                    </th>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            ) : null}
            {timeline?.topics?.length ? (
                <>
                    <h3>事件追踪</h3>
                    <table cellspacing="10">
                        <tbody>
                            {timeline.topics?.map((topic, index) => {
                                const publishDate = topic.publishDate ? parseDate(topic.publishDate) : undefined;
                                return (
                                    <tr key={String(topic.uid ?? topic.title ?? index)}>
                                        <th align="left">
                                            <small>{publishDate ? formatDate(publishDate, 'YYYY-MM-DD HH:mm:ss', 8) : ''}</small>
                                        </th>
                                        <td>
                                            <a href={topic.uid ? new URL(`topic/${topic.uid}`, rootUrl).href : undefined}>{topic.title}</a>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </>
            ) : null}
        </>
    );
