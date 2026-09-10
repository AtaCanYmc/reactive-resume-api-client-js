/**
 * reactive-resume-api-client-js
 * Unofficial TypeScript/JavaScript API client (SDK) for Reactive Resume v4.
 */

export { RxResumeClient, ReactiveResumeClient } from "./client.js";
export {
  ReactiveResumeError,
  ValidationError,
  ReactiveResumeAPIError,
  AuthenticationError,
  NotFoundError,
} from "./errors.js";

export { AuthAPI } from "./api/auth.js";
export { ResumesAPI } from "./api/resumes.js";
export { ApplicationsAPI } from "./api/applications.js";
export { StatisticsAPI } from "./api/statistics.js";
export { AgentAPI } from "./api/agent.js";
export { AiProvidersAPI } from "./api/ai-providers.js";
export { FlagsAPI } from "./api/flags.js";
export { AIAPI } from "./api/ai.js";

export * from "./types/index.js";
