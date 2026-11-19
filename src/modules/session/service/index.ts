import { DeleteResult, In, IsNull, UpdateResult } from "typeorm";
import dataSource from "../../../database/config/ormconfig";
import { Session } from "../entity/session.entity";
import { Answer } from "../../answer/entity/answer.entity";
import { Competence } from "../../competencies/entity/competence.entity";
import { CompetenceScore } from "../entity/competence-score.entity";
import { Documentation } from "../entity/documentation.entity";
import { ObservationNote } from "../entity/observation-note.entity";
import { SessionSignature } from "../entity/session-signature.entity";
import { ChecklistItem } from "../entity/checklist-item.entity";
import { Pdp } from "../../pdp/entity/pdp.entity";
import { PdpObjective } from "../../pdp/entity/pdp-objective.entity";

const SVG_PREFIX = "data:image/svg+xml;utf8,";
// Blue of a ballpoint pen, as on the device; the first signatures were drawn in black
const toPenColor = (svg: string) =>
  svg.replace(/stroke="#111417"/g, 'stroke="#1A3FA8"');

export class SessionService {
  static create = async (data: Session): Promise<Session> => {
    const sessionRepository = await dataSource.getRepository(Session);

    return sessionRepository.save(data);
  };

  static update = async (id: string, data: Session): Promise<UpdateResult> => {
    const sessionRepository = await dataSource.getRepository(Session);

    return sessionRepository.update(id, data);
  };

  static delete = async (id: string): Promise<DeleteResult> => {
    const sessionRepository = await dataSource.getRepository(Session);

    return sessionRepository.delete(id);
  };

  static findByID = async (id: string): Promise<Session | null> => {
    const sessionRepository = await dataSource.getRepository(Session);

    return sessionRepository.findOne({
      where: { id },
      relations: { coach: true, school: true, answers: true, teacher: true },
    });
  };

  // Sessions of the administration list: header only, with the average of the global
  // scores; the grid and the other parts are read one session at a time (findDetails).
  static findAll = async (regionIds?: string[]): Promise<any[]> => {
    if (regionIds && regionIds.length === 0) return [];
    const sessions = await dataSource.getRepository(Session).find({
      where: {
        deleted_at: IsNull(),
        ...(regionIds ? { school: { region_id: In(regionIds) } } : {}),
      },
      relations: { coach: true, school: { region: true }, teacher: true },
      order: { created_at: "DESC" },
    });
    if (sessions.length === 0) return [];

    const averages: { session_id: string; average: number }[] =
      await dataSource.query(
        `SELECT session_id, AVG(value)::float AS average
           FROM competence_score
          WHERE value IS NOT NULL AND deleted_at IS NULL AND session_id = ANY($1)
          GROUP BY session_id`,
        [sessions.map((item) => item.id)]
      );
    const pdps: { session_id: string; status: string }[] = await dataSource.query(
      `SELECT session_id, status FROM pdp WHERE deleted_at IS NULL AND session_id = ANY($1)`,
      [sessions.map((item) => item.id)]
    );

    return sessions.map((session) => ({
      ...session,
      average_score:
        averages.find((item) => item.session_id === session.id)?.average ??
        null,
      pdp_status:
        pdps.find((item) => item.session_id === session.id)?.status ?? null,
    }));
  };

  // Everything an observation holds, for the session sheet of the administration and its
  // two documents printed from the browser.
  static findDetails = async (id: string) => {
    const session = await dataSource.getRepository(Session).findOne({
      where: { id },
      relations: {
        coach: true,
        school: { region: true },
        teacher: true,
        activities: true,
      },
    });
    if (!session) return null;

    const bySession = { where: { session_id: id, deleted_at: IsNull() } };
    const [
      answers,
      scores,
      documentations,
      notes,
      signatures,
      checklist,
      competencies,
      pdp,
    ] = await Promise.all([
      dataSource.getRepository(Answer).find({
        where: { session_id: id, deleted_at: IsNull() },
        select: {
          id: true,
          question_id: true,
          value: true,
          not_applicable: true,
        },
        loadEagerRelations: false,
      }),
      dataSource.getRepository(CompetenceScore).find(bySession),
      dataSource.getRepository(Documentation).find(bySession),
      dataSource
        .getRepository(ObservationNote)
        .find({ ...bySession, order: { noted_at: "ASC" } }),
      dataSource
        .getRepository(SessionSignature)
        .find({ ...bySession, relations: { image: true } }),
      dataSource.getRepository(ChecklistItem).find({
        where: { deleted_at: IsNull() },
        order: { display_order: "ASC" },
      }),
      dataSource.getRepository(Competence).find({
        where: { deleted_at: IsNull() },
        relations: { questions: true },
        order: { display_order: "ASC", questions: { display_order: "ASC" } },
      }),
      dataSource.getRepository(Pdp).findOne({
        where: { session_id: id, deleted_at: IsNull() },
        relations: { rule_set: true },
      }),
    ]);
    const objectives = pdp
      ? await dataSource.getRepository(PdpObjective).find({
          where: { pdp_id: pdp.id, deleted_at: IsNull() },
          order: { rank: "ASC" },
        })
      : [];

    return {
      session,
      answers,
      scores,
      documentations,
      notes,
      checklist,
      competencies: competencies.map((competence) => ({
        ...competence,
        questions: (competence.questions || []).filter(
          (question) => !question.deleted_at
        ),
      })),
      // The drawing is an SVG saved by the device in the image table
      signatures: signatures.map(({ image, ...signature }) => ({
        ...signature,
        svg: image?.value?.startsWith(SVG_PREFIX)
          ? toPenColor(decodeURIComponent(image.value.slice(SVG_PREFIX.length)))
          : null,
      })),
      pdp: pdp ? { ...pdp, objectives } : null,
    };
  };

  // Results of every session of the scope, for the Excel exports of the administration
  static exportData = async (regionIds?: string[]) => {
    const sessions = await SessionService.findAll(regionIds);
    const ids = sessions.map((session) => session.id);
    const bySessions = { where: { session_id: In(ids), deleted_at: IsNull() } };
    const [scores, answers, documentations, pdps, competencies, checklist] =
      await Promise.all([
        dataSource.getRepository(CompetenceScore).find(bySessions),
        dataSource.getRepository(Answer).find({
          ...bySessions,
          select: {
            session_id: true,
            question_id: true,
            value: true,
            not_applicable: true,
          },
          loadEagerRelations: false,
        }),
        dataSource.getRepository(Documentation).find(bySessions),
        dataSource.getRepository(Pdp).find(bySessions),
        dataSource.getRepository(Competence).find({
          where: { deleted_at: IsNull() },
          relations: { questions: true },
          order: { display_order: "ASC", questions: { display_order: "ASC" } },
        }),
        dataSource.getRepository(ChecklistItem).find({
          where: { deleted_at: IsNull() },
          order: { display_order: "ASC" },
        }),
      ]);
    const objectives = pdps.length
      ? await dataSource.getRepository(PdpObjective).find({
          where: {
            pdp_id: In(pdps.map((pdp) => pdp.id)),
            deleted_at: IsNull(),
          },
          order: { rank: "ASC" },
        })
      : [];
    return {
      sessions,
      scores,
      answers,
      documentations,
      pdps,
      objectives,
      competencies,
      checklist,
    };
  };

  static getSessionData = async (
    period?: string,
    regionIds?: string,
    schoolId?: string,
    showOnlyWithValues?: string
  ): Promise<any[]> => {
    const sessionRepository = await dataSource.getRepository(Session);

    const result = await sessionRepository.query(`
        SELECT 
            s.id AS "id",
            s.name AS "School Name",
            COUNT(DISTINCT cs.coach_id) AS "Number of Coaches",
            COUNT(DISTINCT ses.teacher_id) FILTER (WHERE ses.id IS NOT NULL) AS "Teachers with at least 1 Session",
            COUNT(DISTINCT f.id) AS "Number of Feedbacks",
            AVG(a.value) FILTER (WHERE c.title = 'Supportive learning environment') AS "Supportive learning environment",
            AVG(a.value) FILTER (WHERE c.title = 'Critical thinking') AS "Average Value for Critical Thinking",
            AVG(a.value) FILTER (WHERE c.title = 'Effective teaching') AS "Effective teaching",
            AVG(a.value) FILTER (WHERE c.title = 'Time on learning') AS "Time on learning",
            AVG(a.value) FILTER (WHERE c.title = 'Positive behavioral expectations') AS "Positive behavioral expectations"
            
        FROM 
            public.school s
            
            -- Count Coaches
            LEFT JOIN public.coach_school cs ON s.id = cs.school_id
            
            -- Count Teachers with at least 1 Session
            LEFT JOIN public.teacher t ON s.id = t.school_id
            LEFT JOIN public.session ses ON t.id = ses.teacher_id
            
            -- Count and Average Feedbacks
            LEFT JOIN public.answer a ON ses.id = a.session_id
            LEFT JOIN public.feedback f ON a.id = f.answer_id
            LEFT JOIN public.question q ON a.question_id = q.id
            LEFT JOIN public.competence c ON q.competence_id = c.id
          
        WHERE
          1 = 1
          ${showOnlyWithValues === "true" ? "AND cs.coach_id IS NOT null" : ""}
          ${period ? `AND ses.created_at >= NOW() - INTERVAL '${period}'` : ""}
          ${regionIds ? `AND s.region_id in (${regionIds})` : ""}
          ${schoolId ? `AND s.id = '${schoolId}'` : ""}
        GROUP BY 
            s.id;
    `);

    return result;
  };

  static getSessionOverTime = async (
    regionIds?: string,
    schoolId?: string,
    showOnlyWithValues?: string
  ): Promise<any[]> => {
    const sessionRepository = await dataSource.getRepository(Session);

    const result = await sessionRepository.query(`
      SELECT 
          s.id AS "id",
          s.name AS "School Name",
          COUNT(DISTINCT cs.coach_id) AS "Number of Coaches",
          COUNT(DISTINCT ses.teacher_id) FILTER (WHERE ses.id IS NOT NULL) AS "Teachers with at least 1 Session",
          COUNT(DISTINCT f.id) AS "Number of Feedbacks",
          
          COUNT(DISTINCT ses.teacher_id) FILTER (WHERE ses.created_at >= NOW() - INTERVAL '30 days') AS "Last 30 days",
          COUNT(DISTINCT ses.teacher_id) FILTER (WHERE ses.created_at BETWEEN (NOW() - INTERVAL '60 days') AND (NOW() - INTERVAL '30 days')) AS "Last 30 and 60 days",
          COUNT(DISTINCT ses.teacher_id) FILTER (WHERE ses.created_at BETWEEN (NOW() - INTERVAL '90 days') AND (NOW() - INTERVAL '60 days')) AS "Last 60 and 90 days",
          COUNT(DISTINCT ses.teacher_id) FILTER (WHERE ses.created_at <= NOW() - INTERVAL '90 days') AS "More than 90 days ago"
          
      FROM 
          public.school s

          LEFT JOIN public.coach_school cs ON s.id = cs.school_id

          LEFT JOIN public.teacher t ON s.id = t.school_id
          LEFT JOIN public.session ses ON t.id = ses.teacher_id
          
          LEFT JOIN public.answer a ON ses.id = a.session_id
          LEFT JOIN public.feedback f ON a.id = f.answer_id

        WHERE
          1 = 1
          ${showOnlyWithValues === "true" ? "AND cs.coach_id IS NOT null" : ""}
          ${regionIds ? `AND s.region_id in (${regionIds})` : ""}
          ${schoolId ? `AND s.id = '${schoolId}'` : ""}

        GROUP BY 
            s.id;
    `);

    return result;
  };
}
