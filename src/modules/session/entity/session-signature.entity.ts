import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Session } from "./session.entity";
import { Image } from "../../image/entity/image.entity";

// Signature of the observation sheet (B17): teacher, school head and observer.
@Entity()
export class SessionSignature {
  constructor(signature?: Partial<SessionSignature>) {
    Object.assign(this, signature);
  }

  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ nullable: true, type: "uuid" })
  session_id?: string;

  @ManyToOne(() => Session, { onDelete: "CASCADE" })
  @JoinColumn({ name: "session_id" })
  session?: Session;

  // TEACHER, SCHOOL_HEAD or OBSERVER
  @Column({ nullable: true })
  signer_role?: string;

  @Column({ nullable: true })
  signer_name?: string;

  // Drawing of the signature, in the existing image table
  @Column({ nullable: true, type: "uuid" })
  image_id?: string;

  @ManyToOne(() => Image)
  @JoinColumn({ name: "image_id" })
  image?: Image;

  @Column({ nullable: true })
  signed_at?: Date;

  // Teacher only: reason for refusing to sign
  @Column({ nullable: true, type: "text" })
  refusal_reason?: string;

  // School head only: reason for the absence
  @Column({ nullable: true, type: "text" })
  absence_reason?: string;

  @Column({ nullable: true })
  created_at?: Date;

  @Column({ nullable: true })
  updated_at?: Date;

  @Column({ nullable: true })
  deleted_at?: Date;
}
