import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Competence } from "../../competencies/entity/competence.entity";

@Entity()
export class Question {
  constructor(question?: Partial<Question>) {
    Object.assign(this, question);
  }

  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ nullable: true })
  title?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  tooltip_data?: string;

  // option (stars), YES_NO or FME (Faible/Moyen/Élevé)
  @Column({ nullable: true })
  type?: string;

  // Behaviour number in the paper tool (1.1, 2.1.3...)
  @Column({ nullable: true })
  code?: string;

  @Column({ nullable: true })
  display_order?: number;

  // The "N/A" answer is offered
  @Column({ default: false })
  allow_na?: boolean;

  @Column({ nullable: true })
  scale?: number;

  @Column({ nullable: true })
  competence_id?: string;

  @ManyToOne(() => Competence, (competence) => competence.id, { eager: true })
  @JoinColumn({ name: "competence_id" })
  competence?: Competence;

  @Column({ nullable: true })
  created_at?: Date;

  @Column({ nullable: true })
  updated_at?: Date;

  @Column({ nullable: true })
  deleted_at?: Date;
}
