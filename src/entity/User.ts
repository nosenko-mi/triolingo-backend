import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, type Relation} from "typeorm";
import {Credential} from "./Credential";

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar' })
  email?: string;

  @OneToMany(() => Credential, (credential) => credential.user)
  credentials?: Relation<Credential[]>;
}
