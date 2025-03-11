import * as v from "valibot";

export const registerSchema = v.object({
  email: v.pipe(
    v.string(),
    v.email()
  ),
  password: v.pipe(
    v.string(),
    v.minLength(8, 'Password must be at least 8 characters long'),
    v.maxLength(256, 'Password must be at most 256 characters long')
  ),
})
