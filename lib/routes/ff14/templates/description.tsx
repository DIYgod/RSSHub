import { renderToString } from 'hono/jsx/dom/server';

type DescriptionProps = {
    image?: string;
    description?: string;
};

const Description = ({ image, description }: DescriptionProps) => (
    <>
        {image ? (
            <>
                <img src={image} />
                <br />
            </>
        ) : null}
        {description}
    </>
);

export const renderDescription = (props: DescriptionProps): string => renderToString(<Description {...props} />);
