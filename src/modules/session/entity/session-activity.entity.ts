import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Session } from "./session.entity";

// Observed activity of the paper tool ("Activité(s) observée(s)"). One per session
// in this version; the table allows several if the need is confirmed.
@Entity()
export class SessionActivity {
  constructor(activity?: Partial<SessionActivity>) {
    Object.assign(this, activity);
  }

  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ nullable: true, type: "uuid" })
  session_id?: string;

  @ManyToOne(() => Session, (session) => session.activities, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "session_id" })
  session?: Session;

  // Sub-domain of the curriculum (e.g. Mathématiques), not of the observation grid
  @Column({ nullable: true })
  sub_domain?: string;

  @Column({ nullable: true })
  discipline?: string;

  @Column({ nullable: true })
  sheet_code?: string;

  @Column({ nullable: true })
  class_name?: string;

  // "P/I" column of the paper tool
  @Column({ nullable: true })
  p_i?: string;

  @Column({ nullable: true })
  time?: string;

  @Column({ nullable: true, type: "text" })
  essential_knowledge?: string;

  @Column({ nullable: true })
  display_order?: number;

  @Column({ nullable: true })
  created_at?: Date;

  @Column({ nullable: true })
  updated_at?: Date;

  @Column({ nullable: true })
  deleted_at?: Date;
}
