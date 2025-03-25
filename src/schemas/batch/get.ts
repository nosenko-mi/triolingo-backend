import * as v from "valibot";

export const getBatchSchema = v.object({
  source: v.pipe(
    v.string(),
    v.minLength(1, 'Source is required')
  ),
})
