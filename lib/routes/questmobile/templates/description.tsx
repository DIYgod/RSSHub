import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    image?: {
        src?: string;
        alt?: string;
    };
    introduction?: string;
    description?: string;
};

const QuestMobileDescription = ({ image, introduction, description }: DescriptionData) => (
    <>
        {image?.src ? (
            <figure>
                <img alt={image.alt} src={image.src} />
            </figure>
        ) : null}
        {introduction ? <blockquote>{introduction}</blockquote> : null}
        {description ? raw(description) : null}
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<QuestMobileDescription {...data} />);
