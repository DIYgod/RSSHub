import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    author: string;
    company: string;
    content: string;
};

export const renderDescription = ({ author, company, content }: DescriptionData): string =>
    renderToString(
        <>
            <text>{`作者：${author} `}</text>
            <br />
            <text>{`单位：${company} `}</text>
            <br />
            <text>{content}</text>
        </>
    );
