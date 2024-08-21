import type { FC } from 'hono/jsx';
import { Data } from '@/types';

const RSS: FC<{ data: Data }> = ({ data }) => {
    const hasItunes = data.itunes_author || data.itunes_category || (data.item && data.item.some((i) => i.itunes_item_image || i.itunes_duration));
    const hasMedia = data.item?.some((i) => i.media);

    return (
        <rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:itunes={hasItunes ? 'http://www.itunes.com/dtds/podcast-1.0.dtd' : undefined} xmlns:media={hasMedia ? 'http://search.yahoo.com/mrss/' : undefined} version="2.0">
            <channel>
                <title>{data.title || 'RSSHub'}</title>
                <link>{data.link || 'https://docs.rsshub.app'}</link>
                <atom:link href={data.atomlink} rel="self" type="application/rss+xml" />
                <description>{data.description || data.title} - Powered by RSSHub</description>
                <generator>RSSHub</generator>
                <webMaster>contact@rsshub.app (RSSHub)</webMaster>
                {data.itunes_author && <itunes:author>{data.itunes_author}</itunes:author>}
                {data.itunes_category && <itunes:category text={data.itunes_category} />}
                {data.itunes_author && <itunes:explicit>{data.itunes_explicit || 'false'}</itunes:explicit>}
                <language>{data.language || 'en'}</language>
                {data.image && (
                    <image>
                        <url>{data.image}</url>
                        <title>{data.title || 'RSSHub'}</title>
                        <link>{data.link}</link>
                    </image>
                )}
                <lastBuildDate>{data.lastBuildDate}</lastBuildDate>
                <ttl>{data.ttl}</ttl>
                {data.item?.map((item) => (
                    <item>
                        <title>{item.title}</title>
                        <description>{item.description}</description>
                        <link>{item.link}</link>
                        <guid isPermaLink="false">{item.guid || item.link || item.title}</guid>
                        {item.pubDate && <pubDate>{item.pubDate}</pubDate>}
                        {item.author && <author>{item.author}</author>}
                        {item.image && <enclosure url={item.image} type="image/jpeg" />}
                        {item.itunes_item_image && <itunes:image href={item.itunes_item_image} />}
                        {item.enclosure_url && <enclosure url={item.enclosure_url} length={item.enclosure_length} type={item.enclosure_type} />}
                        {item.itunes_duration && <itunes:duration>{item.itunes_duration}</itunes:duration>}
                        {typeof item.category === 'string' ? <category>{item.category}</category> : item.category?.map((c) => <category>{c}</category>)}
                        {item.media &&
                            Object.entries(item.media).map(([key, value]) => {
                                const Tag = `media:${key}`;
                                return <Tag {...value} />;
                            })}
                    </item>
                ))}
            </channel>
        </rss>
    );
};

export default RSS;
