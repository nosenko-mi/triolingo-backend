import {RequestHandler} from "express";
import * as v from "valibot";
import {getFragmentSchema} from "@schemas/fragment/get";
import {getQuiz} from "@controllers/batchController";

export const getFragment: RequestHandler = async (req, res) => {
  const parse = v.safeParse(getFragmentSchema, req.body);
  if (!parse.success) {
    res.status(401).json(parse.issues.map((el) => el.message).join(', '))

    return;
  }

  const query = parse.output;
  const content = query.fragment;

  const response = await getQuiz(content, 'custom', query.requireNew !== 'true');

  res.json(response ?? {
    error: 'Error while getting quiz',
  }).end();
};
