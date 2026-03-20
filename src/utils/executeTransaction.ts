/**
 * Lightweight in-browser execution service for template logic.
 * Proof-of-concept for GSoC: executes user-provided logic code
 * against a request JSON, returning the result.
 */

export interface TransactionResult {
  response: unknown;
  state?: unknown;
  emit?: unknown[];
}

export async function executeTransaction(
  logicCode: string,
  request: unknown,
  state: unknown = {}
): Promise<TransactionResult> {
  // Wrap the user's logic code so it returns the `execute` function
  // The logic code must define: function execute(context) { ... }
  const wrappedCode = `
    ${logicCode}
    return execute({ request, state });
  `;

  // Create a sandboxed function with request and state as parameters
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const fn = new Function("request", "state", wrappedCode);
  const result: unknown = fn(request, state);

  // Support both sync and async logic functions
  const resolved = result instanceof Promise ? await result : result;

  return {
    response: resolved,
    state,
    emit: [],
  };
}
