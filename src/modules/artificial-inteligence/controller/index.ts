import { Request, Response } from "express";
import { constants } from "http2";
import { Competence } from "../../competencies/entity/competence.entity";
import { Answer } from "../../answer/entity/answer.entity";
import { AIService } from "../service";

const {
  HTTP_STATUS_OK,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_UNAUTHORIZED,
} = constants;

export default class AIController {
  public static generateSuggestion = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      const token: any = req.headers.token;

      if (!token) {
        return res.status(HTTP_STATUS_UNAUTHORIZED).send();
      }

      return res
        .status(HTTP_STATUS_OK)
        .send(await AIService.generateSuggestion(req.body));
    } catch (error) {
      console.error({ error });
      return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send();
    }
  };

  public static selectAnswer = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      const competences = req.body;

      /*  const token: any = req.headers.token;

      if (!token) {
        return res.status(HTTP_STATUS_UNAUTHORIZED).send();
      }
      */

      return res
        .status(HTTP_STATUS_OK)
        .send(await AIService.selectAnswer(competences));
    } catch (error) {
      console.error({ error });
      return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send();
    }
  };
}
