import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PdpRuleSet } from "./pdp-rule-set.entity";
import { Question } from "../../question/entity/question.entity";

// Objective proposed for a behaviour, in a version of the PDP rules.
@Entity()
export class PdpLibraryItem {
  constructor(item?: Partial<PdpLibraryItem>) {
    Object.assign(this, item);
  }

  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ nullable: true, type: "uuid" })
  rule_set_id?: string;

  @ManyToOne(() => PdpRuleSet)
  @JoinColumn({ name: "rule_set_id" })
  rule_set?: PdpRuleSet;

  @Column({ nullable: true, type: "uuid" })
  question_id?: string;

  @ManyToOne(() => Question)
  @JoinColumn({ name: "question_id" })
  question?: Question;

  @Column({ nullable: true, type: "text" })
  objective?: string;

  // One action per line
  @Column({ nullable: true, type: "text" })
  actions?: string;

  @Column({ nullable: true, type: "text" })
  indicator?: string;

  @Column({ nullable: true })
  created_at?: Date;

  @Column({ nullable: true })
  updated_at?: Date;

  @Column({ nullable: true })
  deleted_at?: Date;
}
