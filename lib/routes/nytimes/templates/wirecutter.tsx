import type { FC } from 'hono/jsx';
import { renderToString } from 'hono/jsx/dom/server';

const imageBase = 'https://cdn.thewirecutter.com/';

// Presentational or promotional nodes that carry no article content
const dropTypes = new Set(['adslot', 'shortcode-recirc', 'shortcode-scoop_form_callout']);

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
const Callout: FC<{ ribbon?: string; callouts?: any[] }> = ({ ribbon, callouts }) => (
    <>
        {(callouts ?? []).map((pick) => {
            const heading = [pick.ribbon || ribbon, pick.name].filter(Boolean).join(': ');
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

// hono/jsx only applies void-element rules to literal tags, so a dynamic <Tag> has to be self-closed
// explicitly: <Tag></Tag> would emit `<br></br>`, which HTML parsers turn into two line breaks
const Element: FC<{ name: string; attributes?: Record<string, unknown>; nodes?: any[] }> = ({ name, attributes, nodes }) => {
    const Tag = name as unknown as FC;
    return voidTags.has(name) ? (
        <Tag {...attributes} />
    ) : (
        <Tag {...attributes}>
            <Nodes nodes={nodes} />
        </Tag>
    );
};

// Text in the document format carries its formatting as marks rather than as parent elements
const Marked: FC<{ marks?: any[]; children?: any }> = ({ marks, children }) => {
    let rendered = <>{children}</>;
    const applied = marks ?? [];
    for (const mark of applied) {
        switch (mark.type) {
            case 'em':
                rendered = <em>{rendered}</em>;
                break;
            case 'strong':
                rendered = <strong>{rendered}</strong>;
                break;
            case 'wirecutter_link': {
                const href = mark.attrs?.linkUrl;
                rendered = href ? <a href={href}>{rendered}</a> : rendered;
                break;
            }
            default:
                // annotations such as comment_thread carry no presentation
                break;
        }
    }
    return rendered;
};

const Node: FC<{ node: any }> = ({ node }) => {
    const type = node.type;

    if (type === 'text') {
        return <Marked marks={node.marks}>{node.text ?? node.data ?? ''}</Marked>;
    }
    if (type === 'comment') {
        return null;
    }
    if (dropTypes.has(type)) {
        return null;
    }

    // The DOM-shaped format, where the tag name lives in `name`
    if (type === 'tag') {
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
                return <Callout ribbon={node.dbData?.ribbon} callouts={node.dbData?.callouts} />;
            case 'shortcode-pullquote':
                return (
                    <blockquote>
                        <Nodes nodes={node.children} />
                    </blockquote>
                );
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
        return <Element name={name} attributes={attributes} nodes={node.children} />;
    }

    // The document format, where the node type is the element itself
    switch (type) {
        case 'paragraph':
            return (
                <p>
                    <Nodes nodes={node.content} />
                </p>
            );
        case 'scoop_image_block': {
            const image = node.attrs?.image;
            return <Image src={image?.source} alt={image?.alt} caption={[image?.caption, image?.credit].filter(Boolean).join(' ')} />;
        }
        case 'product_callout':
            return <Callout ribbon={node.attrs?.ribbon} callouts={node.attrs?.callouts} />;
        default:
            break;
    }
    if (!allowedTags.has(type)) {
        throw new Error(`Unsupported node type: ${type}`);
    }
    return <Element name={type} nodes={node.content ?? node.children} />;
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
