import { Question } from "../../question/entity/question.entity";
import { Feedback } from "../../session/entity/feedback.entity";
import { Session } from "../../session/entity/session.entity";
import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from "typeorm";

@Entity()
export class Answer {
  constructor(answer?: Partial<Answer>) {
    Object.assign(this, answer);
  }

  @PrimaryGeneratedColumn("uuid")
  id?: string;

  // YES_NO: 0 = Non, 1 = Oui; FME: 1 = Faible, 2 = Moyen, 3 = Élevé; empty when not_applicable
  @Column({ nullable: true })
  value?: number;

  // The observer chose "N/A". The mobile app sends SQLite booleans (0 or 1).
  @Column({
    default: false,
    transformer: {
      to: (value?: boolean | number | string) =>
        value === undefined ? undefined : value === true || Number(value) === 1,
      from: (value: boolean) => value,
    },
  })
  not_applicable?: boolean;

  @Column({ nullable: true })
  question_id?: string;

  @Column({ nullable: true })
  session_id?: string;

  @Column({ nullable: true })
  created_at?: Date;

  @Column({ nullable: true })
  updated_at?: Date;

  @Column({ nullable: true })
  deleted_at?: Date;

  @ManyToOne(() => Question, (question) => question.id, { eager: true })
  @JoinColumn({ name: "question_id" })
  question?: Question;

  @ManyToOne(() => Session, (session) => session.id)
  @JoinColumn({ name: "session_id" })
  session?: Session;

  @OneToMany(() => Feedback, (feedback) => feedback.answer)
  feedback?: Feedback[];
}
