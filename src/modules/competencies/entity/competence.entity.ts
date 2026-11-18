import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Question } from "../../question/entity/question.entity";

@Entity()
export class Competence {
  constructor(competence?: Partial<Competence>) {
    Object.assign(this, competence);
  }

  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ nullable: true })
  title?: string;

  // Sub-domain number in the paper tool (I, II.1...) and its domain, for the DRC grid
  @Column({ nullable: true })
  code?: string;

  @Column({ nullable: true })
  domain_code?: string;

  @Column({ nullable: true })
  domain_title?: string;

  @Column({ nullable: true })
  display_order?: number;

  // The sub-domain receives an overall score from 1 to 5
  @Column({ default: false })
  has_global_score?: boolean;

  @OneToMany(() => Question, (question) => question.competence)
  questions?: Question[];

  @Column({ nullable: true })
  created_at?: Date;

  @Column({ nullable: true })
  updated_at?: Date;

  @Column({ nullable: true })
  deleted_at?: Date;
}
