import axios from "axios";
import { Answer } from "../../answer/entity/answer.entity";
import { Competence } from "../../competencies/entity/competence.entity";
import { School } from "../../school/entity/school.entity";
import OpenAI from "openai";
import config from "../../../config";

interface CompetenceWithAnswers extends Competence {
  answers: Answer[];
}

export class AIService {
  static selectAnswer = async (params: {
    competences: CompetenceWithAnswers[];
    schoolId: School["id"];
  }): Promise<Answer> => {
    const AIModel = new OpenAI({
      apiKey: config.openAIKey,
    });

    const questions = params.competences.reduce((acc, item) => {
      return [
        ...acc,
        ...item.answers.map((answer) => ({
          id: answer.id,
          competenceTitle: item.title,
          questionTitle: answer.question?.title,
          questionMaxAnswer: answer.question?.scale,
          questionAnswer: answer.value,
        })),
      ];
    }, [] as any[]);

    const prompt = `Below you will receive a JSON list of questions from the user. You should judge which question should receive feedback from the user based on the competence and value of the response. Respond only and solely with the question ID.`;

    const AIAnswer = (
      await AIModel.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: JSON.stringify(questions) },
        ],
      })
    ).choices[0].message.content;

    const answer = params.competences.reduce((acc, item) => {
      if (!("id" in acc)) {
        return item.answers.find((answer) => answer.id === AIAnswer) || acc;
      }

      return acc;
    }, {} as Answer);

    return answer;
  };

  static generateSuggestion = async (params: {
    answer: Answer;
  }): Promise<Answer> => {
    return params.answer;
  };
}
