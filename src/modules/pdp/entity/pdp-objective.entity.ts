import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Pdp } from "./pdp.entity";
import { Question } from "../../question/entity/question.entity";

// Objective of a PDP.
@Entity()
export class PdpObjective {
  constructor(objective?: Partial<PdpObjective>) {
    Object.assign(this, objective);
  }

  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ nullable: true, type: "uuid" })
  pdp_id?: string;

  @ManyToOne(() => Pdp, { onDelete: "CASCADE" })
  @JoinColumn({ name: "pdp_id" })
  pdp?: Pdp;

  // Behaviour concerned; empty for an objective added freely
  @Column({ nullable: true, type: "uuid" })
  question_id?: string;

  @ManyToOne(() => Question)
  @JoinColumn({ name: "question_id" })
  question?: Question;

  // PRIORITY or CONSOLIDATE
  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  rank?: number;

  @Column({ nullable: true, type: "text" })
  objective?: string;

  // One action per line
  @Column({ nullable: true, type: "text" })
  actions?: string;

  @Column({ nullable: true, type: "text" })
  indicator?: string;

  @Column({ nullable: true, type: "date" })
  due_date?: string;

  // GENERATED, EDITED or ADDED
  @Column({ nullable: true })
  origin?: string;

  @Column({ nullable: true })
  created_at?: Date;

  @Column({ nullable: true })
  updated_at?: Date;

  @Column({ nullable: true })
  deleted_at?: Date;
}
