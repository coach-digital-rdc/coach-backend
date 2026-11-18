import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Session } from "../../session/entity/session.entity";
import { PdpRuleSet } from "./pdp-rule-set.entity";

// Professional Development Plan of a session (B23): generated on the device from the
// scoring, adjusted with the teacher, then validated.
@Entity()
export class Pdp {
  constructor(pdp?: Partial<Pdp>) {
    Object.assign(this, pdp);
  }

  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ nullable: true, type: "uuid" })
  session_id?: string;

  @ManyToOne(() => Session, { onDelete: "CASCADE" })
  @JoinColumn({ name: "session_id" })
  session?: Session;

  @Column({ nullable: true, type: "uuid" })
  rule_set_id?: string;

  @ManyToOne(() => PdpRuleSet)
  @JoinColumn({ name: "rule_set_id" })
  rule_set?: PdpRuleSet;

  @Column({ nullable: true })
  rule_set_version?: number;

  // Copy of the diagnostic, in JSON: category of each behaviour
  @Column({ nullable: true, type: "text" })
  diagnostic?: string;

  // DRAFT then VALIDATED
  @Column({ nullable: true })
  status?: string;

  @Column({ nullable: true })
  validated_at?: Date;

  @Column({ nullable: true })
  created_at?: Date;

  @Column({ nullable: true })
  updated_at?: Date;

  @Column({ nullable: true })
  deleted_at?: Date;
}
