import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Session } from "./session.entity";

// Timestamped note taken on the device during the observation (B13).
@Entity()
export class ObservationNote {
  constructor(note?: Partial<ObservationNote>) {
    Object.assign(this, note);
  }

  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ nullable: true, type: "uuid" })
  session_id?: string;

  @ManyToOne(() => Session, { onDelete: "CASCADE" })
  @JoinColumn({ name: "session_id" })
  session?: Session;

  // Time of the device when the note was written
  @Column({ nullable: true })
  noted_at?: Date;

  @Column({ nullable: true, type: "text" })
  content?: string;

  @Column({ nullable: true })
  created_at?: Date;

  @Column({ nullable: true })
  updated_at?: Date;

  @Column({ nullable: true })
  deleted_at?: Date;
}
