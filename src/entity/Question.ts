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
import {Quiz} from "@entity/Quiz";

@Entity('questions')
export class Question extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar' })
  source?: string;

  @Column({ type: 'text' })
  fragment?: string;

  @Column({ type: 'varchar' })
  message?: string;

  @ManyToOne(() => Quiz, (quiz) => quiz.question)
  quizzes?: Relation<Quiz[]>;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
