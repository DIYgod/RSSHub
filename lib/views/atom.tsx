import type { FC } from 'hono/jsx';

import type { Data } from '@/types';

const RSS: FC<{ data: Data }> = ({ data }) => (
    <feed xmlns="http://www.w3.org/2005/Atom" xmlns:rsshub="http://rsshub.app/xml/schemas" xml:lang={data.language || 'en'}>
        <title>{data.title || 'RSSHub'}</title>
        <link rel="alternate" href={data.link || 'https://docs.rsshub.app'} />
        <link rel="self" href={data.atomlink} type="application/atom+xml" />
        <id>{data.id || data.link}</id>
        <subtitle>{data.description || data.title} - Powered by RSSHub</subtitle>
        <generator>RSSHub</generator>
        <updated>{new Date(data.lastBuildDate || new Date()).toISOString()}</updated>
        <author>
            <name>{data.author || 'RSSHub'}</name>
        </author>
        {data.icon && <icon>{data.icon}</icon>}
        {data.logo && <logo>{data.logo}</logo>}

        {data.item?.map((item) => (
            <entry>
                <title>{item.title}</title>
                <content type="html">{item.description}</content>
                <link href={item.link} />
                <id>{item.guid || item.link || item.title}</id>
                {item.pubDate && <published>{new Date(item.pubDate).toISOString()}</published>}
                <updated>{new Date(item.updated || item.pubDate || new Date()).toISOString()}</updated>
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
