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
        <div class="item-description">
            {image ? <img src={image} alt={title} /> : null}
            {posted ? (
                <p>
                    posted: <span class="posted">{posted}</span>
                </p>
            ) : null}
            {by ? (
                <p>
                    by: <span class="by">{by}</span>
                </p>
            ) : null}
            {source ? (
                <p>
                    source: <span class="source">{source}</span>
                </p>
            ) : null}
            {rating ? (
                <p>
                    rating: <span class="rating">{rating}</span>
                </p>
            ) : null}
            {score ? (
                <p>
                    score: <span class="score">{score}</span>
                </p>
            ) : null}
        </div>
    );
