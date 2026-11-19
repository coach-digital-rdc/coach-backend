import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CoachSchool } from "./coach-school.entity";
import { Session } from "../../session/entity/session.entity";

@Entity()
export class Coach {
  constructor(coach?: Partial<Coach>) {
    Object.assign(this, coach);
  }

  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  surname?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  pin?: string;

  @Column({ nullable: true })
  nin?: string;

  @Column({ nullable: true })
  birthdate?: Date;

  @Column({ nullable: true })
  image_id?: string;

  // Profile of the observer, shown in the header of the observation sheet (B21)
  @Column({ nullable: true })
  sex?: string;

  // INSPECTOR, ADVISOR, SCHOOL_HEAD or PEER
  @Column({ nullable: true })
  function?: string;

  // Duty station, or area of intervention of an inspector or an advisor
  @Column({ nullable: true })
  duty_station?: string;

  @Column({ nullable: true })
  postal_box?: string;

  @OneToMany(() => CoachSchool, (coachSchool) => coachSchool.coach)
  coachSchools?: CoachSchool[];

  @OneToMany(() => Session, (session) => session.coach)
  sessions?: Session[];

  @Column({ nullable: true })
  created_at?: Date;

  @Column({ nullable: true })
  updated_at?: Date;

  @Column({ nullable: true })
  deleted_at?: Date;
}
