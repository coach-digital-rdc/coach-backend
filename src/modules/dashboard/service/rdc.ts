import dataSource from "../../../database/config/ormconfig";

// Dashboard of the DRC version (B26): activity of the observers, results of the observations
// and follow-up (PDP, learning circles), by function of the observer and by area.
export type DashboardFilters = {
  regionIds?: string[];
  // Region whose sub-regions are the areas of the "by area" table
  areaParentId?: string;
  startDate?: string;
  endDate?: string;
};

// Sessions kept by the filters, as a common table expression; $n placeholders follow params
const sessionsCte = (filters: DashboardFilters, params: unknown[]) => {
  const where = ["ses.deleted_at IS NULL"];
  if (filters.regionIds) {
    params.push(filters.regionIds);
    where.push(`sc.region_id = ANY($${params.length})`);
  }
  if (filters.startDate && filters.endDate) {
    params.push(filters.startDate, filters.endDate);
    where.push(
      `ses.created_at BETWEEN $${params.length - 1} AND $${params.length}`
    );
  }
  return `WITH s AS (
    SELECT ses.*, sc.region_id,
           (ses.session_status IS NULL OR UPPER(ses.session_status) = 'COMPLETED') AS closed
      FROM session ses
      JOIN school sc ON sc.id = ses.school_id
     WHERE ${where.join(" AND ")}
  )`;
};

const run = async <T = any>(
  filters: DashboardFilters,
  sql: (cte: string) => string,
  extra: unknown[] = []
): Promise<T[]> => {
  const params: unknown[] = [...extra];
  const cte = sessionsCte(filters, params);
  return dataSource.query(sql(cte), params);
};

export class RdcDashboardService {
  static getData = async (filters: DashboardFilters) => {
    if (filters.regionIds && filters.regionIds.length === 0) {
      filters = { ...filters, regionIds: ["00000000-0000-0000-0000-000000000000"] };
    }

    const [
      totals,
      average,
      byFunction,
      byRegion,
      bySubDomain,
      appreciations,
      months,
      behaviours,
      checklist,
      pdps,
    ] = await Promise.all([
      run(
        filters,
        (cte) => `${cte}
        SELECT COUNT(*)::int AS sessions,
               COUNT(*) FILTER (WHERE closed)::int AS closed_sessions,
               COUNT(DISTINCT teacher_id)::int AS teachers,
               COUNT(DISTINCT coach_id)::int AS observers,
               COUNT(DISTINCT school_id)::int AS schools
          FROM s`
      ),
      run(
        filters,
        (cte) => `${cte}
        SELECT AVG(cs.value)::float AS average
          FROM competence_score cs JOIN s ON s.id = cs.session_id
         WHERE cs.deleted_at IS NULL AND cs.value IS NOT NULL`
      ),
      run(
        filters,
        (cte) => `${cte}
        SELECT COALESCE(s.observer_function, c.function, 'UNKNOWN') AS function,
               COUNT(DISTINCT s.id)::int AS sessions,
               COUNT(DISTINCT s.coach_id)::int AS observers,
               COUNT(DISTINCT s.teacher_id)::int AS teachers,
               AVG(cs.value)::float AS average
          FROM s
          LEFT JOIN coach c ON c.id = s.coach_id
          LEFT JOIN competence_score cs ON cs.session_id = s.id AND cs.deleted_at IS NULL
         GROUP BY 1 ORDER BY 2 DESC`
      ),
      run(
        filters,
        (cte) => `${cte}
        SELECT s.region_id, r.mpath,
               ARRAY_AGG(DISTINCT s.id) AS sessions,
               ARRAY_AGG(DISTINCT s.teacher_id) AS teachers,
               ARRAY_AGG(DISTINCT s.coach_id) AS observers
          FROM s JOIN region r ON r.id = s.region_id
         GROUP BY s.region_id, r.mpath`
      ),
      run(
        filters,
        (cte) => `${cte}
        SELECT c.id, c.code, c.title, c.display_order,
               AVG(cs.value)::float AS average,
               COUNT(cs.value)::int AS count,
               ${[1, 2, 3, 4, 5]
                 .map(
                   (n) =>
                     `COUNT(*) FILTER (WHERE cs.value = ${n})::int AS score_${n}`
                 )
                 .join(", ")}
          FROM competence c
          LEFT JOIN (SELECT cs.* FROM competence_score cs JOIN s ON s.id = cs.session_id
                      WHERE cs.deleted_at IS NULL) cs ON cs.competence_id = c.id
         WHERE c.deleted_at IS NULL AND c.has_global_score
         GROUP BY c.id ORDER BY c.display_order`
      ),
      run(
        filters,
        (cte) => `${cte}
        SELECT appreciation, COUNT(*)::int AS count
          FROM s WHERE closed AND appreciation IS NOT NULL
         GROUP BY 1`
      ),
      run(
        filters,
        (cte) => `${cte}
        SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
               COUNT(*)::int AS sessions
          FROM s WHERE created_at IS NOT NULL
         GROUP BY 1 ORDER BY 1 DESC LIMIT 12`
      ),
      run(
        filters,
        (cte) => `${cte}
        SELECT q.id, q.code, q.title, COUNT(*)::int AS count
          FROM pdp_objective o
          JOIN pdp p ON p.id = o.pdp_id AND p.deleted_at IS NULL
          JOIN s ON s.id = p.session_id
          JOIN question q ON q.id = o.question_id
         WHERE o.deleted_at IS NULL
         GROUP BY q.id ORDER BY 4 DESC, q.code LIMIT 10`
      ),
      run(
        filters,
        (cte) => `${cte}
        SELECT ci.id, ci.code, ci.document_name, ci.owner,
               COUNT(*) FILTER (WHERE d.answer = true)::int AS yes,
               COUNT(*) FILTER (WHERE d.answer = false)::int AS no
          FROM checklist_item ci
          LEFT JOIN (SELECT d.* FROM documentation d JOIN s ON s.id = d.session_id
                      WHERE d.deleted_at IS NULL) d ON d.checklist_item_id = ci.id
         WHERE ci.deleted_at IS NULL
         GROUP BY ci.id ORDER BY ci.display_order`
      ),
      run(
        filters,
        (cte) => `${cte}
        SELECT COUNT(*)::int AS total,
               COUNT(*) FILTER (WHERE UPPER(p.status) = 'VALIDATED')::int AS validated
          FROM pdp p JOIN s ON s.id = p.session_id
         WHERE p.deleted_at IS NULL`
      ),
    ]);

    return {
      totals: { ...totals[0], average_score: average[0]?.average ?? null },
      byFunction,
      byArea: await RdcDashboardService.groupByArea(byRegion, filters),
      bySubDomain,
      appreciations,
      months: months.reverse(),
      behaviours,
      checklist,
      pdps: pdps[0],
      learningCircles: await RdcDashboardService.getLearningCircles(filters),
    };
  };

  // Sessions of each region added up in its area: the sub-regions of the selected region,
  // or the provinces when no region is selected
  private static groupByArea = async (
    rows: {
      region_id: string;
      mpath: string;
      sessions: string[];
      teachers: string[];
      observers: string[];
    }[],
    filters: DashboardFilters
  ) => {
    const regions: { id: string; name: string; level: number; mpath: string }[] =
      await dataSource.query(
        `SELECT id, name, level, mpath FROM region WHERE deleted_at IS NULL`
      );
    const parent = regions.find((item) => item.id === filters.areaParentId);
    const depth = parent ? parent.mpath.split(".").filter(Boolean).length : 0;

    const areas: {
      [id: string]: {
        sessions: Set<string>;
        teachers: Set<string>;
        observers: Set<string>;
      };
    } = {};
    for (const row of rows) {
      const path = (row.mpath || "").split(".").filter(Boolean);
      if (parent && path[depth - 1] !== parent.id) continue;
      const areaId = path[depth] || row.region_id;
      areas[areaId] = areas[areaId] || {
        sessions: new Set(),
        teachers: new Set(),
        observers: new Set(),
      };
      row.sessions.forEach((id) => areas[areaId].sessions.add(id));
      row.teachers.forEach((id) => id && areas[areaId].teachers.add(id));
      row.observers.forEach((id) => id && areas[areaId].observers.add(id));
    }

    const averages: { id: string; average: number }[] = Object.keys(areas)
      .length
      ? await dataSource.query(
          `SELECT session_id AS id, AVG(value)::float AS average
             FROM competence_score
            WHERE deleted_at IS NULL AND value IS NOT NULL AND session_id = ANY($1)
            GROUP BY session_id`,
          [Object.values(areas).flatMap((area) => [...area.sessions])]
        )
      : [];

    return Object.entries(areas)
      .map(([id, area]) => {
        const scores = averages.filter((item) => area.sessions.has(item.id));
        return {
          id,
          name: regions.find((item) => item.id === id)?.name || "—",
          sessions: area.sessions.size,
          teachers: area.teachers.size,
          observers: area.observers.size,
          average: scores.length
            ? scores.reduce((sum, item) => sum + item.average, 0) /
              scores.length
            : null,
        };
      })
      .sort((a, b) => b.sessions - a.sessions);
  };

  // Learning circles of the schools of the selected regions (B22)
  private static getLearningCircles = async (filters: DashboardFilters) => {
    const params: unknown[] = [];
    const where = ["t.deleted_at IS NULL"];
    if (filters.regionIds) {
      params.push(filters.regionIds);
      where.push(`sc.region_id = ANY($${params.length})`);
    }
    if (filters.startDate && filters.endDate) {
      params.push(filters.startDate, filters.endDate);
      where.push(
        `t.created_at BETWEEN $${params.length - 1} AND $${params.length}`
      );
    }
    const result = await dataSource.query(
      `SELECT COUNT(*)::int AS sessions,
              COALESCE(SUM(t.participants_count), 0)::int AS participants
         FROM tlc_evaluation t
         JOIN school sc ON sc.id = t.school_id
        WHERE ${where.join(" AND ")}`,
      params
    );
    return result[0];
  };
}
