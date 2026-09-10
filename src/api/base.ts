import type { RxResumeClient } from "../client.js";

/**
 * Base API module that delegates HTTP requests to the parent client.
 */
export abstract class BaseAPI {
  protected readonly client: RxResumeClient;

  constructor(client: RxResumeClient) {
    this.client = client;
  }
}
