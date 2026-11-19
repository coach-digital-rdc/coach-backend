import { DeleteResult, In, IsNull, UpdateResult } from "typeorm";
import dataSource from "../../../database/config/ormconfig";
import { Teacher } from "../entity/teacher.entity";

export class TeacherService {
  static create = async (data: Teacher): Promise<Teacher> => {
    const userRepository = await dataSource.getRepository(Teacher);

    return userRepository.save(data);
  };

  static update = async (id: string, data: Teacher): Promise<UpdateResult> => {
    const userRepository = await dataSource.getRepository(Teacher);

    return userRepository.update(id, data);
  };

  static delete = async (id: string): Promise<DeleteResult> => {
    const userRepository = await dataSource.getRepository(Teacher);

    return userRepository.delete(id);
  };

  static findByID = async (id: string): Promise<Teacher | null> => {
    const userRepository = await dataSource.getRepository(Teacher);

    return userRepository.findOne({ where: { id } });
  };

  // Teachers of the schools of the scope, with their school and their observations
  static findAll = async (regionIds?: string[]): Promise<any[]> => {
    if (regionIds && regionIds.length === 0) return [];
    const teachers = await dataSource.getRepository(Teacher).find({
      where: {
        deleted_at: IsNull(),
        ...(regionIds ? { school: { region_id: In(regionIds) } } : {}),
      },
      relations: { school: { region: true } },
      order: { name: "ASC" },
    });
    const sessions: { teacher_id: string; count: number; last: Date }[] =
      await dataSource.query(
        `SELECT teacher_id, COUNT(*)::int AS count, MAX(COALESCE(completed_at, created_at)) AS last
           FROM session WHERE deleted_at IS NULL GROUP BY teacher_id`
      );
    return teachers.map((teacher) => ({
      ...teacher,
      sessions_count:
        sessions.find((item) => item.teacher_id === teacher.id)?.count || 0,
      last_session:
        sessions.find((item) => item.teacher_id === teacher.id)?.last || null,
    }));
  };
}
