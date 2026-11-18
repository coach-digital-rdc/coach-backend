import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Session } from "./session.entity";
import { Competence } from "../../competencies/entity/competence.entity";

// Global score of a sub-domain for a session, from 1 to 5 (B15).
@Entity()
export class CompetenceScore {
  constructor(score?: Partial<CompetenceScore>) {
    Object.assign(this, score);
  }

  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ nullable: true, type: "uuid" })
  session_id?: string;

  @ManyToOne(() => Session, { onDelete: "CASCADE" })
  @JoinColumn({ name: "session_id" })
  session?: Session;

  @Column({ nullable: true, type: "uuid" })
  competence_id?: string;

  @ManyToOne(() => Competence)
  @JoinColumn({ name: "competence_id" })
  competence?: Competence;

  // Score suggested by the application from the behaviours of the sub-domain
  @Column({ nullable: true })
  suggested_value?: number;

  // Score chosen by the observer
  @Column({ nullable: true })
  value?: number;

  @Column({ nullable: true })
  created_at?: Date;

  @Column({ nullable: true })
  updated_at?: Date;

  @Column({ nullable: true })
  deleted_at?: Date;
}
