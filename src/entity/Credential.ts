import {BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn, type Relation} from "typeorm";
import {User} from "./User";

export enum CREDENTIAL_TYPE {
  CREDENTIAL_PASSWORD,
  CREDENTIAL_OAUTH_GOOGLE,
}

@Entity('credentials')
export class Credential extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'enum', enum: CREDENTIAL_TYPE })
  type?: CREDENTIAL_TYPE;

  @Column({ type: 'varchar', length: '2048' })
  data?: string;

  @ManyToOne(() => User, (user) => user.credentials)
  user?: Relation<User>;
}
