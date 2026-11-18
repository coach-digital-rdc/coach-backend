import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Session } from "./session.entity";
import { ChecklistItem } from "./checklist-item.entity";

@Entity()
export class Documentation {
  constructor(documentation?: Partial<Documentation>) {
    Object.assign(this, documentation);
  }

  @PrimaryGeneratedColumn("uuid")
  id?: number;

  // Unused, kept for compatibility
  @Column({ nullable: true })
  value?: string;

  @Column({ nullable: true, type: "uuid" })
  session_id?: string;

  // Answer of the document checklist (B12): one per document and per session
  @Column({ nullable: true, type: "uuid" })
  checklist_item_id?: string;

  @ManyToOne(() => ChecklistItem)
  @JoinColumn({ name: "checklist_item_id" })
  checklist_item?: ChecklistItem;

  // true = Oui, false = Non, empty = not filled in. The mobile app sends SQLite booleans (0 or 1).
  @Column({
    nullable: true,
    transformer: {
      to: (value?: boolean | number | string | null) =>
        value === undefined || value === null || value === ""
          ? value
          : value === true || Number(value) === 1,
      from: (value: boolean | null) => value,
    },
  })
  answer?: boolean;

  // Proposal of the observer when the answer is Non
  @Column({ nullable: true, type: "text" })
  proposal?: string;

  // Step of the session when the answer was given: PREPARATION or EVALUATION
  @Column({ nullable: true })
  filled_in_phase?: string;

  @ManyToOne(() => Session, (session) => session.id)
  @JoinColumn({ name: "session_id" })
  session?: Session;

  @Column({ nullable: true })
  created_at?: Date;

  @Column({ nullable: true })
  updated_at?: Date;

  @Column({ nullable: true })
  deleted_at?: Date;
}
