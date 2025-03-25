import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn
} from "typeorm";
import {Question} from "@entity/Question";

export enum QUIZ_TYPE {
  QUIZ_SINGLE_ANSWER = 'single_answer'
}

@Entity('quizzes')
export class Quiz extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'enum', enum: QUIZ_TYPE, default: QUIZ_TYPE.QUIZ_SINGLE_ANSWER })
  type?: QUIZ_TYPE;

  @Column({ type: 'json' })
  answers?: {
    correct: boolean;
    text: string;
  }[]

  @ManyToOne(() => Question)
  question?: Relation<Question>;

  @Column({ type: 'varchar' })
  message?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
