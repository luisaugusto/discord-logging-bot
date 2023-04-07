import { config } from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';
config();

const configuration = new Configuration({
  organization: process.env.OPENAI_ORG,
  apiKey: process.env.OPENAI_KEY
});
export const openai = new OpenAIApi(configuration);
