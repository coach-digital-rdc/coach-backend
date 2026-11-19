import { DeleteResult, IsNull, UpdateResult } from "typeorm";
import dataSource from "../../../database/config/ormconfig";
import { Coach } from "../entity/coach.entity";

export class CoachService {
  static create = async (data: Coach): Promise<Coach> => {
    const userRepository = await dataSource.getRepository(Coach);

    if (!data.email) {
      throw Error("Email is required");
    }

    if (
      await userRepository.exist({
        where: { email: data.email.toLocaleLowerCase().trim() },
      })
    ) {
      throw Error("Exists a coach with this email");
    }

    return userRepository.save({
      ...data,
      email: data.email.toLocaleLowerCase().trim(),
    });
  };

  static update = async (
    id: string,
    {
      name,
      surname,
      email,
      phone,
      birthdate,
      nin,
      pin,
      sex,
      function: observerFunction,
      duty_station,
      postal_box,
    }: Coach
  ): Promise<UpdateResult> => {
    const userRepository = await dataSource.getRepository(Coach);

    return userRepository.update(id, {
      name,
      surname,
      email: email?.toLocaleLowerCase().trim(),
      phone,
      birthdate,
      nin,
      pin,
      // Profile of the observer (B21); the devices receive it at their next synchronisation
      sex,
      function: observerFunction,
      duty_station,
      postal_box,
      updated_at: new Date(),
    });
  };

  static delete = async (id: string): Promise<DeleteResult> => {
    const userRepository = await dataSource.getRepository(Coach);

    return userRepository.delete(id);
  };

  static findByID = async (id: string): Promise<Coach | null> => {
    const userRepository = await dataSource.getRepository(Coach);

    return userRepository.findOne({ where: { id } });
  };

  static findByEmail = async (email: string): Promise<Coach | null> => {
    const userRepository = await dataSource.getRepository(Coach);

    return userRepository.findOne({
      where: { email },
      relations: {
        coachSchools: { school: true },
        sessions: { feedback: true, answers: true },
      },
    });
  };

  // Observers of the administration: their schools, and their activity counted on the server
  static findAll = async (regionIds?: string[]): Promise<any[]> => {
    if (regionIds && regionIds.length === 0) return [];
    const coaches = await dataSource.getRepository(Coach).find({
      where: { deleted_at: IsNull() },
      relations: { coachSchools: { school: { region: true } } },
      order: { name: "ASC" },
    });
    const activity: {
      coach_id: string;
      sessions: number;
      teachers: number;
      last_session: Date;
    }[] = await dataSource.query(
      `SELECT coach_id, COUNT(*)::int AS sessions,
              COUNT(DISTINCT teacher_id)::int AS teachers,
              MAX(COALESCE(completed_at, created_at)) AS last_session
         FROM session WHERE deleted_at IS NULL GROUP BY coach_id`
    );

    return coaches
      .map((coach) => ({
        ...coach,
        coachSchools: (coach.coachSchools || []).filter(
          (item) => !item.deleted_at
        ),
        sessions_count:
          activity.find((item) => item.coach_id === coach.id)?.sessions || 0,
        teachers_count:
          activity.find((item) => item.coach_id === coach.id)?.teachers || 0,
        last_session:
          activity.find((item) => item.coach_id === coach.id)?.last_session ||
          null,
      }))
      .filter(
        (coach) =>
          !regionIds ||
          coach.coachSchools.some((item) =>
            regionIds.includes(`${item.school?.region_id}`)
          )
      );
  };
}
