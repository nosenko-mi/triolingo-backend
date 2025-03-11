import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn
} from "typeorm";
import {Credential} from "./Credential";

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar' })
  email?: string;

  @OneToMany(() => Credential, (credential) => credential.user, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  credentials?: Relation<Credential[]>;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
