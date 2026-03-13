import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    summary?: string;
    image?: string;
};

const JandanDescription = ({ summary, image }: DescriptionData) => (
    <>
        <blockquote>
            <p>{summary}</p>
        </blockquote>
        <img src={image} />
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<JandanDescription {...data} />);
