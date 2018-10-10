// @flow

export type ShakaRequest = {
  uris: Array<string>,
  method: string,
  body: ArrayBuffer,
  headers: { [string]: string },
  allowCrossSiteCredentials: boolean,
  retryParameters: {
    maxAttempts: number,
    baseDelay: number,
    backoffFactor: number,
    fuzzFactor: number,
    timeout: number
  }
};

export type ShakaResponse = {
  uri: string, 
  data: ArrayBuffer, 
  headers: { [string]: string }, 
  timeMs?: number, 
  fromCache?: boolean
};

export type ShakaRequestFilter = (type: string, request: ShakaRequest) => Promise<any>;
export type ShakaResponseFilter = (type: string, response: ShakaResponse) => Promise<any>;