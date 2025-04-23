import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne, OneToMany,
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

  @OneToMany(() => Quiz, (quiz) => quiz.question)
  quizzes?: Relation<Quiz[]>;

  @Column({ type: 'varchar' })
  description?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
