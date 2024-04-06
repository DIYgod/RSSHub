import type { FC } from 'hono/jsx';
import { Data } from '@/types';

const RSS: FC<{ data: Data }> = ({ data }) => (
    <feed xmlns="http://www.w3.org/2005/Atom" xmlns:rsshub="http://rsshub.app/xml/schemas">
        <title>{data.title || 'RSSHub'}</title>
        <link href={data.link || 'https://docs.rsshub.app'} />
        <id>{data.id || data.link}</id>
        <subtitle>{data.description || data.title} - Made with love by RSSHub(https://github.com/DIYgod/RSSHub)</subtitle>
        <generator>RSSHub</generator>
        <webMaster>i@diygod.me (DIYgod)</webMaster>
        <language>{data.language || 'en'}</language>
        <updated>{data.lastBuildDate}</updated>
        <author>
            <name>{data.author || 'RSSHub'}</name>
        </author>
        {data.icon && <icon>{data.icon}</icon>}
        {data.logo && <logo>{data.logo}</logo>}

        {data.item?.map((item) => (
            <entry>
                <title>{item.title}</title>
                <content type="html" src={item.link}>
                    {item.description}
                </content>
                <link href={item.link} />
                <id>{item.guid || item.link || item.title}</id>
                {item.pubDate && <published>{item.pubDate}</published>}
                {item.updated && <updated>{item.updated || item.pubDate}</updated>}
                {item.author && (
                    <author>
                        <name>{item.author}</name>
                    </author>
                )}
                {typeof item.category === 'string' ? <category term={item.category}></category> : item.category?.map((c) => <category term={c}></category>)}
                {item.media &&
                    Object.entries(item.media).map(([key, value]) => {
                        const Tag = `media:${key}`;
                        return <Tag {...value} />;
                    })}
                {item.upvotes ? <rsshub:upvotes>{item.upvotes}</rsshub:upvotes> : ''}
                {item.downvotes ? <rsshub:downvotes>{item.downvotes}</rsshub:downvotes> : ''}
                {item.comments ? <rsshub:comments>{item.comments}</rsshub:comments> : ''}
            </entry>
        ))}
    </feed>
);

export default RSS;
