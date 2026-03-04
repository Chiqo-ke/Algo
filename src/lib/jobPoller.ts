/**
 * Poll /api/jobs/<jobId>/ until the Celery task reaches SUCCESS or FAILURE.
 *
 * Usage:
 *   const result = await pollJob<MyResultType>(jobId, onProgress, signal);
 *
 * The `onProgress` callback fires on every PROGRESS update from the worker,
 * letting you update a spinner or progress bar in real time.
 */

import { API_ENDPOINTS } from './api';

const POLL_INTERVAL_MS = 3000;

// Derive the jobs base URL from the API base (strip trailing /api path)
const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api')
  .replace(/\/api$/, '');

export interface JobProgress {
  step?: string;
  pct?: number;
  run_id?: string;
  [key: string]: unknown;
}

export interface JobStatusResponse {
  job_id: string;
  state: 'PENDING' | 'STARTED' | 'PROGRESS' | 'SUCCESS' | 'FAILURE' | 'REVOKED';
  progress: JobProgress | null;
  result: unknown | null;
  error: string | null;
}

/**
 * Poll a Celery job until it finishes.
 *
 * @param jobId        The task UUID returned by the enqueue endpoint.
 * @param onProgress   Optional callback called on every PROGRESS update.
 * @param signal       Optional AbortSignal to cancel polling (e.g. on component unmount).
 * @returns            Resolves with the task's return value on SUCCESS.
 *                     Rejects with an Error on FAILURE / REVOKED / network error.
 */
export function pollJob<T = unknown>(
  jobId: string,
  onProgress?: (progress: JobProgress) => void,
  signal?: AbortSignal,
): Promise<T> {
  const url = `${API_BASE}/api/jobs/${jobId}/`;

  return new Promise((resolve, reject) => {
    const tick = async () => {
      if (signal?.aborted) {
        reject(new Error('Polling cancelled'));
        return;
      }

      try {
        const res = await fetch(url, {
          credentials: 'include',
          headers: { 'Accept': 'application/json' },
          signal,
        });

        if (!res.ok) {
          reject(new Error(`Job status check failed: HTTP ${res.status}`));
          return;
        }

        const data: JobStatusResponse = await res.json();

        if (data.state === 'PROGRESS' && data.progress && onProgress) {
          onProgress(data.progress);
        }

        if (data.state === 'SUCCESS') {
          resolve(data.result as T);
          return;
        }

        if (data.state === 'FAILURE' || data.state === 'REVOKED') {
          reject(new Error(data.error ?? 'Task failed'));
          return;
        }

        // Still running (PENDING / STARTED / PROGRESS) — schedule next poll
        setTimeout(tick, POLL_INTERVAL_MS);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          reject(new Error('Polling cancelled'));
        } else {
          reject(err);
        }
      }
    };

    tick();
  });
}
