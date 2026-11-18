import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

// Version of the PDP rules (B18). Version 1 is loaded with the grid; the rules
// will be edited and published from the administration (B19).
@Entity()
export class PdpRuleSet {
  constructor(ruleSet?: Partial<PdpRuleSet>) {
    Object.assign(this, ruleSet);
  }

  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ nullable: true })
  version?: number;

  // DRAFT, PUBLISHED (sent to the devices, one at a time) or ARCHIVED
  @Column({ nullable: true })
  status?: string;

  // Answers of each category, threshold of the sub-domain score below which its
  // behaviours are priorities, and time given to reach the objectives
  @Column({ nullable: true, type: "jsonb" })
  diagnostic_config?: {
    strength: string[];
    consolidate: string[];
    priority: string[];
    priority_threshold: number;
    due_in_days: number;
  };

  @Column({ nullable: true })
  max_objectives?: number;

  @Column({ nullable: true })
  published_at?: Date;

  @Column({ nullable: true, type: "uuid" })
  published_by?: string;

  @Column({ nullable: true })
  created_at?: Date;

  @Column({ nullable: true })
  updated_at?: Date;

  @Column({ nullable: true })
  deleted_at?: Date;
}
