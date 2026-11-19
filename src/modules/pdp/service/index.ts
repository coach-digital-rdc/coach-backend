import { IsNull } from "typeorm";
import dataSource from "../../../database/config/ormconfig";
import { PdpRuleSet } from "../entity/pdp-rule-set.entity";
import { PdpLibraryItem } from "../entity/pdp-library-item.entity";
import { User } from "../../user/entity/user.entity";

export type LibraryInput = {
  question_id: string;
  objective?: string;
  actions?: string;
  indicator?: string;
};

export type RuleSetInput = {
  diagnostic_config?: PdpRuleSet["diagnostic_config"];
  max_objectives?: number;
  library?: LibraryInput[];
};

const ANSWER_CODES = ["YES", "NO", "LOW", "MEDIUM", "HIGH"];

export class RuleSetError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

// Every answer belongs to exactly one category, and the numbers stay in a sensible range
const validate = (input: RuleSetInput) => {
  const config = input.diagnostic_config;
  if (config) {
    const codes = [
      ...(config.strength || []),
      ...(config.consolidate || []),
      ...(config.priority || []),
    ];
    if (
      codes.length !== ANSWER_CODES.length ||
      ANSWER_CODES.some((code) => !codes.includes(code))
    ) {
      throw new RuleSetError(
        "Each answer (YES, NO, LOW, MEDIUM, HIGH) must be in exactly one category"
      );
    }
    if (
      !(config.priority_threshold >= 1 && config.priority_threshold <= 5) ||
      !(config.due_in_days >= 1 && config.due_in_days <= 365)
    ) {
      throw new RuleSetError(
        "The threshold goes from 1 to 5 and the due date from 1 to 365 days"
      );
    }
  }
  if (
    input.max_objectives !== undefined &&
    !(input.max_objectives >= 1 && input.max_objectives <= 10)
  ) {
    throw new RuleSetError("The number of objectives goes from 1 to 10");
  }
};

// Versions of the PDP rules (B19): one draft is prepared from a version, edited, then
// published; the devices receive the published version at their next synchronisation.
export class PdpRuleSetService {
  static findAll = async () =>
    dataSource.query(
      `SELECT r.id, r.version, r.status, r.max_objectives, r.diagnostic_config,
              r.published_at, r.created_at, r.updated_at, u.name AS published_by_name,
              (SELECT COUNT(*) FROM pdp_library_item l
                WHERE l.rule_set_id = r.id AND l.deleted_at IS NULL)::int AS library_count,
              (SELECT COUNT(*) FROM pdp p
                WHERE p.rule_set_id = r.id AND p.deleted_at IS NULL)::int AS pdp_count
         FROM pdp_rule_set r
         LEFT JOIN "user" u ON u.id = r.published_by
        WHERE r.deleted_at IS NULL
        ORDER BY r.version DESC`
    );

  static findById = async (id: string) => {
    const ruleSet = await dataSource
      .getRepository(PdpRuleSet)
      .findOne({ where: { id, deleted_at: IsNull() } });
    if (!ruleSet) return null;
    const library = await dataSource.getRepository(PdpLibraryItem).find({
      where: { rule_set_id: id, deleted_at: IsNull() },
    });
    const publisher = ruleSet.published_by
      ? await dataSource
          .getRepository(User)
          .findOne({ where: { id: ruleSet.published_by } })
      : null;
    return { ...ruleSet, published_by_name: publisher?.name || null, library };
  };

  static createDraft = async (fromId?: string) => {
    const repository = dataSource.getRepository(PdpRuleSet);
    if (
      await repository.findOne({
        where: { status: "DRAFT", deleted_at: IsNull() },
      })
    ) {
      throw new RuleSetError("A draft is already being prepared", 409);
    }
    const source = fromId
      ? await repository.findOne({ where: { id: fromId, deleted_at: IsNull() } })
      : await repository.findOne({
          where: { status: "PUBLISHED", deleted_at: IsNull() },
          order: { version: "DESC" },
        });
    if (!source) throw new RuleSetError("Version not found", 404);

    // A deleted draft was never sent to the devices: its number can be used again
    const last = await repository.findOne({
      where: { deleted_at: IsNull() },
      order: { version: "DESC" },
    });
    const now = new Date();
    const draft = await repository.save(
      new PdpRuleSet({
        version: (last?.version || 0) + 1,
        status: "DRAFT",
        diagnostic_config: source.diagnostic_config,
        max_objectives: source.max_objectives,
        created_at: now,
        updated_at: now,
      })
    );
    const library = await dataSource.getRepository(PdpLibraryItem).find({
      where: { rule_set_id: source.id, deleted_at: IsNull() },
    });
    await dataSource.getRepository(PdpLibraryItem).save(
      library.map(
        ({ id, ...item }) =>
          new PdpLibraryItem({
            ...item,
            rule_set_id: draft.id,
            created_at: now,
            updated_at: now,
          })
      )
    );
    return PdpRuleSetService.findById(draft.id as string);
  };

  static updateDraft = async (id: string, input: RuleSetInput) => {
    const ruleSet = await PdpRuleSetService.getDraft(id);
    validate(input);
    const now = new Date();

    await dataSource.transaction(async (manager) => {
      await manager.getRepository(PdpRuleSet).update(id, {
        ...(input.diagnostic_config
          ? { diagnostic_config: input.diagnostic_config }
          : {}),
        ...(input.max_objectives ? { max_objectives: input.max_objectives } : {}),
        updated_at: now,
      });

      if (input.library) {
        const repository = manager.getRepository(PdpLibraryItem);
        const existing = await repository.find({
          where: { rule_set_id: ruleSet.id, deleted_at: IsNull() },
        });
        for (const item of input.library) {
          const current = existing.find(
            (entry) => entry.question_id === item.question_id
          );
          await repository.save(
            new PdpLibraryItem({
              ...(current || { created_at: now, rule_set_id: id }),
              question_id: item.question_id,
              objective: item.objective,
              actions: item.actions,
              indicator: item.indicator,
              updated_at: now,
            })
          );
        }
        const kept = input.library.map((item) => item.question_id);
        for (const entry of existing) {
          if (!kept.includes(entry.question_id as string)) {
            await repository.update(entry.id as string, {
              deleted_at: now,
              updated_at: now,
            });
          }
        }
      }
    });
    return PdpRuleSetService.findById(id);
  };

  // The published version becomes archived; the PDPs already made keep their version
  static publish = async (id: string, userId?: string) => {
    await PdpRuleSetService.getDraft(id);
    const now = new Date();
    await dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(PdpRuleSet);
      await repository.update(
        { status: "PUBLISHED", deleted_at: IsNull() },
        { status: "ARCHIVED", updated_at: now }
      );
      await repository.update(id, {
        status: "PUBLISHED",
        published_at: now,
        published_by: userId,
        updated_at: now,
      });
    });
    return PdpRuleSetService.findById(id);
  };

  static deleteDraft = async (id: string) => {
    await PdpRuleSetService.getDraft(id);
    const now = new Date();
    await dataSource
      .getRepository(PdpLibraryItem)
      .update({ rule_set_id: id }, { deleted_at: now, updated_at: now });
    await dataSource
      .getRepository(PdpRuleSet)
      .update(id, { deleted_at: now, updated_at: now });
  };

  private static getDraft = async (id: string) => {
    const ruleSet = await dataSource
      .getRepository(PdpRuleSet)
      .findOne({ where: { id, deleted_at: IsNull() } });
    if (!ruleSet) throw new RuleSetError("Version not found", 404);
    if (ruleSet.status !== "DRAFT") {
      throw new RuleSetError("Only a draft can be changed", 409);
    }
    return ruleSet;
  };
}
