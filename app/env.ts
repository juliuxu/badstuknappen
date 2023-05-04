import { z } from "zod";

// Password
const envVariables = z.object({
  PASSWORD: z.string().nonempty(),
});
envVariables.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
