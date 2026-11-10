import type { ApiError } from 'texivia-fetch';

/** A message for the user. Cancelled requests (E_ABORTED) are no error and give ''. */
export function describeError(error: ApiError): string {
  const [, status, code, , fields] = error;
  // A server error without an error body comes from a proxy or gateway: the API itself did not answer.
  if (code === 'E_HTTP_ERROR' && status >= 500) return 'The recipe service is not reachable. Is the API running?';
  switch (code) {
    case 'E_ABORTED':
      return '';
    case 'E_NETWORK_ERROR':
      return 'The recipe service is not reachable. Is the API running?';
    case 'VALIDATION_INVALID_INPUT':
      return fields?.length
        ? `Please check: ${fields.map((f) => f.path).join(', ')}`
        : 'Please check your input.';
    case 'DATA_NOT_FOUND':
      return 'This recipe does not exist (any more).';
    default:
      return `Something went wrong (${code}).`;
  }
}
