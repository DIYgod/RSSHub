import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    image?: string;
    title?: string;
    posted?: string;
    by?: string;
    source?: string;
    rating?: string;
    score?: string;
};

export const renderDescription = ({ image, title, posted, by, source, rating, score }: DescriptionData) =>
    renderToString(
        <div className="item-description">
            {image ? <img src={image} alt={title} /> : null}
            {posted ? (
                <p>
                    posted: <span className="posted">{posted}</span>
                </p>
            ) : null}
            {by ? (
                <p>
                    by: <span className="by">{by}</span>
                </p>
            ) : null}
            {source ? (
                <p>
                    source: <span className="source">{source}</span>
                </p>
            ) : null}
            {rating ? (
                <p>
                    rating: <span className="rating">{rating}</span>
                </p>
            ) : null}
            {score ? (
                <p>
                    score: <span className="score">{score}</span>
                </p>
            ) : null}
        </div>
    );
