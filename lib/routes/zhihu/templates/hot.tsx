import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

export interface HotAnswerEntry {
    id: string;
    author: string;
    voteupCount: number;
    contentHtml?: string;
    excerptText?: string;
    link: string;
}

interface HotDescriptionInput {
    excerpt: string;
    answers: HotAnswerEntry[];
}

const formatAnswerHeading = (answer: HotAnswerEntry): string => (answer.voteupCount > 0 ? `${answer.author}（${answer.voteupCount} 赞同）` : answer.author);

export const renderHotDescription = (input: HotDescriptionInput): string => {
    const trimmedExcerpt = input.excerpt.trim();
    const showExcerpt = Boolean(trimmedExcerpt) && !(input.answers.length > 0 && trimmedExcerpt === '[图片]');

    if (!showExcerpt && input.answers.length === 0) {
        return '';
    }

    return renderToString(
        <>
            {showExcerpt &&
                (input.answers.length > 0 ? (
                    <blockquote>
                        <p>{input.excerpt}</p>
                    </blockquote>
                ) : (
                    <p>{input.excerpt}</p>
                ))}
            {input.answers.map((answer, index) => (
                <div key={answer.id}>
                    {index > 0 && <hr />}
                    <h3>
                        <a href={answer.link}>{formatAnswerHeading(answer)}</a>
                    </h3>
                    {answer.contentHtml ? raw(answer.contentHtml) : answer.excerptText ? <p>{answer.excerptText}</p> : null}
                </div>
            ))}
        </>
    );
};
