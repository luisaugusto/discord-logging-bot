import { config } from "dotenv";
import { OpenAI } from "openai";
config();

export const openai = new OpenAI({
  organization: process.env.OPENAI_ORG,
  apiKey: process.env.OPENAI_KEY,
});
