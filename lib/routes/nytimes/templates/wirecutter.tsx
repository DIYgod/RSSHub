import type { FC } from 'hono/jsx';
import { renderToString } from 'hono/jsx/dom/server';

const imageBase = 'https://cdn.thewirecutter.com/';

// Presentational or promotional nodes that carry no article content
const dropTypes = new Set(['adslot', 'shortcode-recirc', 'shortcode-scoop_form_callout']);

// hono/jsx only applies void-element rules to literal tags, so a dynamic <Tag> must be self-closed
// explicitly: <Tag></Tag> would emit `<br></br>`, which HTML parsers turn into two line breaks
const voidTags = new Set(['br', 'hr', 'img', 'source']);

const allowedTags = new Set([
    'p',
    'a',
    'strong',
    'b',
    'em',
    'i',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'br',
    'hr',
    'img',
    'blockquote',
    'figure',
    'figcaption',
    'div',
    'span',
    'video',
    'source',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
]);
// Everything else is layout plumbing or tracking metadata
const allowedAttributes = new Set(['href', 'src', 'alt', 'title', 'width', 'height', 'colspan', 'rowspan']);

// Images are served through a resizing CDN; without the query string the original is returned
const originalImage = (url: string): string => (url.startsWith('http') ? url : `${imageBase}${url.replace(/^\//, '')}`).split('?', 1)[0];

const Image: FC<{ src?: string; alt?: string; caption?: string }> = ({ src, alt, caption }) =>
    src ? (
        <figure>
            <img src={originalImage(src)} alt={alt || undefined} />
            {caption ? <figcaption>{caption}</figcaption> : null}
        </figure>
    ) : null;

// A Wirecutter pick: the product, why it won, and its photo
const Callout: FC<{ node: any }> = ({ node }) => (
    <>
        {(node.dbData?.callouts ?? []).map((pick) => {
            const heading = [pick.ribbon || node.dbData?.ribbon, pick.name].filter(Boolean).join(': ');
            return (
                <blockquote>
                    {heading ? <h4>{heading}</h4> : null}
                    <Image src={pick.images?.full} alt={pick.name} />
                    {pick.title ? (
                        <p>
                            <strong>{pick.title}</strong>
                        </p>
                    ) : null}
                    {pick.description ? <p>{pick.description}</p> : null}
                </blockquote>
            );
        })}
    </>
);

const Nodes: FC<{ nodes?: any[] }> = ({ nodes }) => (
    <>
        {(nodes ?? []).map((node) => (
            <Node node={node} />
        ))}
    </>
);

const Node: FC<{ node: any }> = ({ node }) => {
    if (node.type === 'text') {
        return <>{node.data ?? ''}</>;
    }
    if (node.type === 'comment') {
        return null;
    }
    if (node.type !== 'tag') {
        throw new Error(`Unsupported node type: ${node.type}`);
    }

    const name = node.name;
    if (dropTypes.has(name)) {
        return null;
    }
    switch (name) {
        case 'shortcode-gallery':
            return (
                <>
                    {(node.dbData ?? []).map((image) => (
                        <Image src={image.dbData?.source ?? image.imagePaths?.full} alt={image.alt} caption={image.credit} />
                    ))}
                </>
            );
        case 'shortcode-callout':
            return <Callout node={node} />;
        case 'shortcode-caption':
            return (
                <figure>
                    <Nodes nodes={node.children} />
                    {node.dbData?.credit ? <figcaption>{node.dbData.credit}</figcaption> : null}
                </figure>
            );
        default:
            break;
    }
    if (!allowedTags.has(name)) {
        throw new Error(`Unsupported tag: ${name}`);
    }

    const attributes = Object.fromEntries(
        Object.entries(node.attribs ?? {})
            .filter(([key]) => allowedAttributes.has(key))
            .map(([key, value]) => [key, key === 'src' ? originalImage(String(value)) : value])
    );
    const Tag = name as unknown as FC;

    return voidTags.has(name) ? (
        <Tag {...attributes} />
    ) : (
        <Tag {...attributes}>
            <Nodes nodes={node.children} />
        </Tag>
    );
};

const Post: FC<{ post: any }> = ({ post }) => (
    <>
        {post.heroImage ? <Image src={post.heroImage.source} alt={post.heroImage.alt} caption={post.heroImage.caption} /> : null}
        {(post.chapters ?? []).map((chapter) => (
            <>
                {chapter.title ? <h2>{chapter.title}</h2> : null}
                <Nodes nodes={chapter.body} />
            </>
        ))}
    </>
);

export const renderPost = (post: any): string => renderToString(<Post post={post} />);
