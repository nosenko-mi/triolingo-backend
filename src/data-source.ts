import {DataSource} from "typeorm";
import {User} from "@entity/User";
import {Credential} from "@entity/Credential";
import {Question} from "@entity/Question";
import {Quiz} from "@entity/Quiz";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.TYPEORM_HOST,
  port: Number(process.env.TYPEORM_PORT),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
  logging: process.env.TYPEORM_LOGGING === 'true',
  entities: [User, Credential, Question, Quiz],
  subscribers: [],
  migrations: [],
})
