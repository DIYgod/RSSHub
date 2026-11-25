import { renderToString } from 'hono/jsx/dom/server';

type QuestionDescriptionProps = {
    question: {
        difficulty: string;
    };
};

const QuestionDescription = ({ question }: QuestionDescriptionProps) => (
    <div>
        {question.difficulty}
        <br />
        <br />
    </div>
);

export const renderQuestionDescription = (props: QuestionDescriptionProps): string => renderToString(<QuestionDescription {...props} />);
