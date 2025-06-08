import * as v from "valibot";

export const getFragmentSchema = v.object({
  fragment: v.pipe(
    v.string(),
    v.minLength(1, 'Fragment is required'),
    v.maxLength(1024, 'Fragment is too long')
  ),
  requireNew: v.optional(v.string(), 'false')
})
