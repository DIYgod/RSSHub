import { renderToString } from 'hono/jsx/dom/server';

type QuestionDescriptionProps = {
    question: {
        difficulty: string;
        date: string;
        tags: string;
    };
};

const QuestionDescription = ({ question }: QuestionDescriptionProps) => (
    <div>
        {question.difficulty} {question.date}
        <br />
        <br />
        {question.tags}
        <br />
        <br />
    </div>
);

export const renderQuestionDescription = (props: QuestionDescriptionProps): string => renderToString(<QuestionDescription {...props} />);
