import { renderToString } from 'hono/jsx/dom/server';

type ListDescriptionProps = {
    ranking_value?: string;
    title: string;
    original_title?: string;
    rate?: string;
    card_subtitle?: string;
    description?: string;
    cover?: string;
};

const ListDescription = ({ ranking_value, title, original_title, rate, card_subtitle, description, cover }: ListDescriptionProps) => (
    <>
        {ranking_value ? <p>{ranking_value}</p> : null}
        <p>{title}</p>
        {original_title ? <p>{original_title}</p> : null}
        {rate ? <p>{rate}</p> : null}
        {card_subtitle ? <p>{card_subtitle}</p> : null}
        {description ? <p>{description}</p> : null}
        {cover ? <img src={cover} /> : null}
    </>
);

export const renderListDescription = (props: ListDescriptionProps): string => renderToString(<ListDescription {...props} />);
