import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

// Document of the checklist of the paper tool (annex B), e.g. "Journal de classe".
@Entity()
export class ChecklistItem {
  constructor(item?: Partial<ChecklistItem>) {
    Object.assign(this, item);
  }

  @PrimaryGeneratedColumn("uuid")
  id?: string;

  // Number of the document, from 1 to 15
  @Column({ nullable: true })
  code?: number;

  // TEACHER (documents of the teacher) or LEARNER (documents of the learners)
  @Column({ nullable: true })
  owner?: string;

  @Column({ nullable: true })
  document_name?: string;

  @Column({ nullable: true, type: "text" })
  statement?: string;

  @Column({ nullable: true })
  display_order?: number;

  @Column({ nullable: true })
  created_at?: Date;

  @Column({ nullable: true })
  updated_at?: Date;

  @Column({ nullable: true })
  deleted_at?: Date;
}
