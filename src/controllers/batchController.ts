import {RequestHandler} from "express";
import * as v from "valibot";
import {getBatchSchema} from "@schemas/batch/get";
import * as fs from 'fs';
import {GoogleGenerativeAI, ResponseSchema, SchemaType} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const getBatch: RequestHandler = async (req, res) => {
  const parse = v.safeParse(getBatchSchema, req.query);
  if (!parse.success) {
    res.status(401).json(parse.issues.map((el) => el.message).join(', '))

    return;
  }

  const query = parse.output;

  try {
    const content = getRandomParagraph(`./batches/${query.source}.txt`);
    if (!content) {
      res.end(`Error while getting text from source "${query.source}"`);

      return;
    }

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
          description: 'list of quiz questions, null if error',
          nullable: true,
          minItems: 2,
          maxItems: 5,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              type: {
                description: 'Type of question. single_answer - one correct answer',
                type: SchemaType.STRING,
                format: 'enum',
                enum: ['single_answer']
              },
              text: {
                type: SchemaType.STRING,
                description: 'Question text',
              },
              answers: {
                type: SchemaType.ARRAY,
                minItems: 2,
                maxItems: 4,
                items: {
                  type: SchemaType.OBJECT,
                  description: 'Answers for question',
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
                },
              },
            },
          },
        },
      },
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

    res.json(json).end();
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(401).end(err.message)

      return;
    }

    res.status(401).end('Unknown error')
  }
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
