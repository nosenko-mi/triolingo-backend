import * as v from "valibot";

export const googleCallbackSchema = v.object({
  accessToken: v.pipe(
    v.string(),
    v.minBytes(1),
    v.maxBytes(2048),
  ),
  // refreshToken: v.pipe(
  //   v.string(),
  //   v.length(512),
  // )
})
