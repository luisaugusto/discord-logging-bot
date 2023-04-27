declare namespace NodeJS {
  export interface ProcessEnv {
    TOKEN: string;
    CLIENT_ID: string;
    LOGGING_CHANNEL: string;
    REPORTS_CHANNEL: string;
    WELCOME_CHANNEL: string;
    ANNIVERSARY_CHANNEL: string;
    GIPHY_KEY: string;
    OPENAI_KEY: string;
    OPENAI_ORG: string;
    FIREBASE_API_KEY: string;
    FIREBASE_APP_ID: string;
    LOGTAIL_KEY: string;
  }
}
