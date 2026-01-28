import { renderToString } from 'hono/jsx/dom/server';

type ContentChild = {
    text?: string;
    color?: string;
    bold?: boolean;
    type?: string;
    id?: string | number;
};

type ContentParagraph = {
    type?: string;
    children?: ContentChild[];
};

const LkongContent = ({ content }: { content: ContentParagraph[] }) => (
    <>
        {content?.map((paragraph) =>
            paragraph.type === 'paragraph' ? (
                <p>
                    {paragraph.children?.map((child) => {
                        if (child.text) {
                            return <span style={child.color ? `color: ${child.color}` : undefined}>{child.bold ? <strong>{child.text}</strong> : child.text}</span>;
                        }
                        if (child.type === 'emotion') {
                            return <img src={`https://image.lkong.com/bq/em${child.id}.gif`} />;
                        }
                        return null;
                    })}
                </p>
            ) : null
        )}
    </>
);

export const renderContent = (content: ContentParagraph[]) => renderToString(<LkongContent content={content} />);
