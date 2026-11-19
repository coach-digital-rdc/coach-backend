import { EntityTarget, In, IsNull, MoreThan, ObjectLiteral } from "typeorm";
import { Feedback } from "../../session/entity/feedback.entity";
import { Teacher } from "../../teacher/entity/teacher.entity";
import { Session } from "../../session/entity/session.entity";
import dataSource from "../../../database/config/ormconfig";
import { Answer } from "../../answer/entity/answer.entity";
import { Coach } from "../../coach/entity/coach.entity";
import { DataToSync, SyncData } from "../controller/types";
import { Image } from "../../image/entity";
import { Sync } from "../entity";
import { School } from "../../school/entity/school.entity";
import { Question } from "../../question/entity/question.entity";
import { CoachSchool } from "../../coach/entity/coach-school.entity";
import { CompetenceService } from "../../competencies/service";
import { QuestionService } from "../../question/service";
import { SessionActivity } from "../../session/entity/session-activity.entity";
import { ObservationNote } from "../../session/entity/observation-note.entity";
import { CompetenceScore } from "../../session/entity/competence-score.entity";
import { TlcEvaluation } from "../../tlc/entity/tlc-evaluation.entity";
import { SessionSignature } from "../../session/entity/session-signature.entity";
import { Pdp } from "../../pdp/entity/pdp.entity";
import { PdpObjective } from "../../pdp/entity/pdp-objective.entity";
import { PdpRuleSet } from "../../pdp/entity/pdp-rule-set.entity";
import { PdpLibraryItem } from "../../pdp/entity/pdp-library-item.entity";
import { Documentation } from "../../session/entity/documentation.entity";
import { ChecklistItem } from "../../session/entity/checklist-item.entity";

export class SyncService {
  // Each device once, with its last synchronisation and the number of synchronisations
  static findAll = async (): Promise<any[]> =>
    dataSource.query(
      `SELECT DISTINCT ON ("deviceId") id, model, "deviceId", "apiLevel",
              COALESCE("lastPulledAt", created_at) AS "lastPulledAt",
              COUNT(*) OVER (PARTITION BY "deviceId")::int AS count
         FROM sync
        WHERE deleted_at IS NULL
        ORDER BY "deviceId", COALESCE("lastPulledAt", created_at) DESC NULLS LAST`
    );

  static sync = async (
    { apiLevel, deviceId, lastPulledAt, model, changes, lastSync }: DataToSync,
    school: School
  ): Promise<SyncData> => {
    const syncRepository = await dataSource.getRepository(Sync);
    try {
      // Time of the synchronisation, read by the administration
      const now = new Date();
      await syncRepository.save({
        apiLevel,
        deviceId,
        lastPulledAt: now,
        model,
        created_at: now,
        updated_at: now,
      });

      await this.saveSyncByEntity(Coach, changes.coaches || []);
      await this.saveSyncByEntity(CoachSchool, changes.coachSchools || []);
      await this.saveSyncByEntity(Image, changes.images || []);
      await this.saveSyncByEntity(Teacher, changes.teachers || []);
      await this.saveSyncByEntity(Session, changes.sessions || []);
      await this.saveSyncByEntity(Answer, changes.answers || []);
      await this.saveSyncByEntity(
        SessionActivity,
        changes.sessionActivities || []
      );
      await this.saveSyncByEntity(Documentation, changes.documentations || []);
      await this.saveSyncByEntity(
        ObservationNote,
        changes.observationNotes || [],
        true
      );
      await this.saveSyncByEntity(
        CompetenceScore,
        changes.competenceScores || []
      );
      await this.saveSyncByEntity(Pdp, changes.pdps || []);
      await this.saveSyncByEntity(
        TlcEvaluation,
        changes.tlcEvaluations || []
      );
      await this.saveSyncByEntity(
        SessionSignature,
        changes.sessionSignatures || []
      );
      await this.saveSyncByEntity(
        PdpObjective,
        changes.pdpObjectives || [],
        true
      );
      await this.saveSyncByEntity(Feedback, changes.feedbacks || []);

      const { coaches, coachSchools } = await this.getCoachDataToSync(school);
      const teachers = await this.getDataToSync(Teacher, undefined, school);
      const sessions = await this.getDataToSync(Session, lastSync, school);
      const answers = await this.getAnswerToSync(sessions);
      const sessionActivities = await this.getSessionActivitiesToSync(sessions);
      const documentations = await this.getDocumentationsToSync(sessions);
      const { pdps, pdpObjectives, pdpRuleSets, pdpLibraryItems } =
        await this.getPdpToSync(sessions);
      const sessionSignatures = await dataSource
        .getRepository(SessionSignature)
        .find({ where: { session_id: In(sessions.map((item) => item.id)) } });
      const competenceScores = await dataSource
        .getRepository(CompetenceScore)
        .find({ where: { session_id: In(sessions.map((item) => item.id)) } });
      const observationNotes = await dataSource
        .getRepository(ObservationNote)
        .find({ where: { session_id: In(sessions.map((item) => item.id)) } });
      const checklistItems = await dataSource
        .getRepository(ChecklistItem)
        .find({ where: { deleted_at: IsNull() }, order: { display_order: "ASC" } });
      const feedbacks = await this.getFeedbackToSync(school, lastSync);
      const competencies = await CompetenceService.findAll();
      const questions = await QuestionService.findAll();

      return {
        coaches,
        competencies,
        coachSchools,
        feedbacks,
        questions,
        schools: [],
        sessions,
        teachers,
        answers,
        sessionActivities,
        documentations,
        observationNotes,
        competenceScores,
        pdps,
        sessionSignatures,
        pdpObjectives,
        pdpRuleSets,
        pdpLibraryItems,
        checklistItems,
        total:
          coaches.length +
          feedbacks.length +
          questions.length +
          sessions.length +
          teachers.length,
      };
    } catch (err) {
      throw new Error(err as any);
    }
  };

  // keepDeletion: the deletion made on the device is kept (e.g. a deleted note)
  static saveSyncByEntity = async (
    Entity: EntityTarget<ObjectLiteral>,
    changes: any[],
    keepDeletion = false
  ) => {
    const repository = await dataSource.getRepository(Entity);

    await Promise.all(
      changes.map(async (item) =>
        repository.save({
          ...item,
          created_at: new Date(item.created_at).toJSON(),
          updated_at: undefined,
          deleted_at: keepDeletion ? item.deleted_at || null : undefined,
        })
      )
    );
  };

  static getAnswerToSync = async (sessions: Session[]) => {
    const repository = await dataSource.getRepository(Answer);
    return await repository.find({
      where: { session_id: In(sessions.map((item) => item.id)) },
    });
  };

  static getSessionActivitiesToSync = async (sessions: Session[]) => {
    const repository = await dataSource.getRepository(SessionActivity);
    return await repository.find({
      where: { session_id: In(sessions.map((item) => item.id)) },
    });
  };

  // Plans of the sessions, and the published rules that the devices apply offline
  static getPdpToSync = async (sessions: Session[]) => {
    const pdps = await dataSource.getRepository(Pdp).find({
      where: { session_id: In(sessions.map((item) => item.id)) },
    });
    const pdpObjectives = await dataSource.getRepository(PdpObjective).find({
      where: { pdp_id: In(pdps.map((item) => item.id)) },
    });
    const pdpRuleSets = await dataSource.getRepository(PdpRuleSet).find({
      where: { status: "PUBLISHED", deleted_at: IsNull() },
    });
    const pdpLibraryItems = await dataSource
      .getRepository(PdpLibraryItem)
      .find({
        where: {
          rule_set_id: In(pdpRuleSets.map((item) => item.id)),
          deleted_at: IsNull(),
        },
      });
    return { pdps, pdpObjectives, pdpRuleSets, pdpLibraryItems };
  };

  static getDocumentationsToSync = async (sessions: Session[]) => {
    const repository = await dataSource.getRepository(Documentation);
    return await repository.find({
      where: { session_id: In(sessions.map((item) => item.id)) },
    });
  };

  static getDataToSync = async (
    Entity: EntityTarget<ObjectLiteral>,
    lastSync?: string,
    school?: School
  ) => {
    const repository = await dataSource.getRepository(Entity);
    if (!lastSync) {
      return await repository.find(
        school ? { where: { school_id: school.id } } : undefined
      );
    } else {
      return await repository.find({
        where: [
          {
            ...(school ? { school_id: school.id } : {}),
            created_at: MoreThan(new Date(lastSync)),
          },
          {
            ...(school ? { school_id: school.id } : {}),
            updated_at: MoreThan(new Date(lastSync)),
          },
          {
            ...(school ? { school_id: school.id } : {}),
            deleted_at: MoreThan(new Date(lastSync)),
          },
        ],
      });
    }
  };

  static getCoachDataToSync = async (
    school: School
  ): Promise<{ coaches: Coach[]; coachSchools: CoachSchool[] }> => {
    const coachSchoolRepository = await dataSource.getRepository(CoachSchool);
    const coachSchools = await coachSchoolRepository.find({
      where: {
        school_id: school.id,
      },
    });

    return {
      coachSchools,
      coaches: coachSchools.map((item) => item.coach) as Coach[],
    };
  };

  static getFeedbackToSync = async (school: School, lastSync?: string) => {
    const repository = await dataSource.getRepository(Feedback);
    if (!lastSync) {
      return await repository.find(
        school
          ? { where: { answer: { session: { school_id: school?.id } } } }
          : undefined
      );
    } else {
      return await repository.find({
        where: {
          answer: { session: { school_id: school?.id } },
          created_at: MoreThan(new Date(lastSync)),
        },
      });
    }
  };
}
