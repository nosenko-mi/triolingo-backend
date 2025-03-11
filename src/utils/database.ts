import {EntityManager} from "typeorm";

export const runWithManager = async <T>(
  callback: (manager: EntityManager) => Promise<T>,
  manager: EntityManager | null = null
): Promise<T> => {
  if (manager) {
    return callback(manager);
  } else {
    return await global.db.transaction(
      async (transactionalEntityManager: EntityManager) => {
        return callback(transactionalEntityManager);
      }
    );
  }
};

export const hideField = <T extends Record<string, any>, K extends keyof T>(
  object: T,
  fields: K | K[]
): Omit<T, K> => {
  const result = { ...object };
  const fieldArray = Array.isArray(fields) ? fields : [fields];

  fieldArray.forEach((field) => {
    delete result[field];
  });

  return result;
};
