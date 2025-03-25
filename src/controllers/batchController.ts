import {RequestHandler} from "express";
import * as v from "valibot";
import {getBatchSchema} from "@schemas/batch/get";
import * as fs from 'fs';
import {GoogleGenerativeAI, ResponseSchema, SchemaType} from "@google/generative-ai";
import {Question} from "@entity/Question";
import {Quiz, QUIZ_TYPE} from "@entity/Quiz";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const getBatch: RequestHandler = async (req, res) => {
  const parse = v.safeParse(getBatchSchema, req.query);
  if (!parse.success) {
    res.status(401).json(parse.issues.map((el) => el.message).join(', '))

    return;
  }

  const query = parse.output;
  const content = getRandomParagraph(`./batches/${query.source}.txt`);
  if (!content) {
    res.end(`Error while getting text from source "${query.source}"`);

    return;
  }

  const response = await getQuiz(content, query.source, query.requireNew !== 'true');

  res.json(response ?? {
    error: 'Error while getting quiz',
  }).end();
};

const getRandomParagraph = (filePath: string): string | null => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const paragraphs = content.split(/\r?\n\r?\n/).map(p => p.trim()).filter(p => p.length > 0);

    if (paragraphs.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * paragraphs.length);

    return paragraphs[randomIndex];
  } catch (error) {
    console.error('File read error:', error);

    return null;
  }
}

const getQuiz = async (content: string, source = '', useCache = true) => {
  console.log('getQuiz', content, source, useCache);

  if (useCache) {
    const question = await global.db.getRepository(Question)
      .createQueryBuilder('question')
      .where('question.fragment = :content', { content })
      .orderBy('RAND()')
      .getOne();

    if (question) {
      return question;
    }
  }

  try {
    const schema: ResponseSchema = {
      description: "Fetch a batch of quiz questions",
      type: SchemaType.OBJECT,
      properties: {
        error: {
          type: SchemaType.STRING,
          description: "A error, if there ever was one, null if none",
          nullable: true,
        },
        message: {
          type: SchemaType.STRING,
          description: "Question for user",
          nullable: false,
        },
        quizzes: {
          type: SchemaType.ARRAY,
          description: 'list of quiz questions, empty if error',
          nullable: false,
          minItems: 2,
          maxItems: 5,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              type: {
                description: `Type of question. ${QUIZ_TYPE.QUIZ_SINGLE_ANSWER} - one correct answer`,
                type: SchemaType.STRING,
                format: 'enum',
                enum: [QUIZ_TYPE.QUIZ_SINGLE_ANSWER]
              },
              text: {
                type: SchemaType.STRING,
                description: 'Question text',
              },
              answers: {
                type: SchemaType.ARRAY,
                description: 'Answers for question',
                minItems: 2,
                maxItems: 4,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    text: {
                      description: 'Answer text',
                      type: SchemaType.STRING,
                    },
                    correct: {
                      description: 'Is answer correct',
                      type: SchemaType.BOOLEAN,
                    },
                  },
                  required: ['text', 'correct'],
                },
              },
            },
            required: ['type', 'text', 'answers'],
          },
        },
      },
      required: ['message', 'quizzes'],
    };

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const geminiRes = await model.generateContent(`Я вчу англійську мову. Тобі передається фрагмент тексту. Тобі потрібно скласти за ним запитання англійською мовою. Текст: ${content}`);

    const json = JSON.parse(geminiRes.response.text());

    console.log(json);

    await global.db.transaction(async (manager) => {
      let quizzes: Quiz[] = [];
      for (const _quiz of json.quizzes) {
        const quiz = new Quiz();
        quiz.type = _quiz.type;
        quiz.message = _quiz.text;
        quiz.answers = _quiz.answers;

        quizzes.push(quiz);
      }

      quizzes = await manager.save(quizzes);

      const question = new Question();
      question.fragment = content;
      question.source = source;
      question.message = json.message;
      question.quizzes = quizzes;

      await manager.save(question);
    })

    return json;
  } catch (err: unknown) {
    console.error(err);

    return null;
  }
}
