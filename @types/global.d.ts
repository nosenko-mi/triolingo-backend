import { DataSource } from "typeorm";

declare global {
  var db: DataSource;
}

export {};
