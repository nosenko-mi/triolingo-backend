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
import {User} from "./User";

export enum CREDENTIAL_TYPE {
  CREDENTIAL_PASSWORD = 'password',
  CREDENTIAL_OAUTH_GOOGLE = 'google',
}

@Entity('credentials')
export class Credential extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'enum', enum: CREDENTIAL_TYPE })
  type?: CREDENTIAL_TYPE;

  @Column({ type: 'varchar', length: '2048' })
  data?: string;

  @ManyToOne(() => User, (user) => user.credentials, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  user?: Relation<User>;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
