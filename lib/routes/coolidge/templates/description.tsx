import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    image?: string;
    intro?: string;
};

const CoolidgeDescription = ({ image, intro }: DescriptionData) => (
    <>
        {image ? (
            <p>
                <img src={image} />
            </p>
        ) : null}
        <p>{intro}</p>
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<CoolidgeDescription {...data} />);
