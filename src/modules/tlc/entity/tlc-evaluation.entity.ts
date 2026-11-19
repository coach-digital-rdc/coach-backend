import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

// Learning circle run with the teachers of a school (B22): unit, participants and rating
// of the participation by the observer who led it.
@Entity({ name: "tlc_evaluation" })
export class TlcEvaluation {
  constructor(evaluation?: Partial<TlcEvaluation>) {
    Object.assign(this, evaluation);
  }

  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ nullable: true })
  unit_id?: string;

  @Column({ nullable: true, type: "uuid" })
  coach_id?: string;

  @Column({ nullable: true, type: "uuid" })
  school_id?: string;

  // Rating of the participation, from 1 to 5
  @Column({ nullable: true })
  evaluation?: string;

  // Names of the teachers who took part, in JSON
  @Column({ nullable: true, type: "text" })
  participants?: string;

  @Column({ nullable: true })
  participants_count?: number;

  @Column({ nullable: true })
  created_at?: Date;

  @Column({ nullable: true })
  updated_at?: Date;

  @Column({ nullable: true })
  deleted_at?: Date;
}
