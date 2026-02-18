import { compareProjects } from '../core/comparator.ts';
import type { WorkerRequest, WorkerResponse } from '../core/types.ts';

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { type, projectA, projectB } = e.data;

  if (type === 'analyze') {
    try {
      const results = compareProjects(projectA, projectB, (progress) => {
        const msg: WorkerResponse = { type: 'progress', data: progress };
        self.postMessage(msg);
      });

      const msg: WorkerResponse = { type: 'result', data: results };
      self.postMessage(msg);
    } catch (err) {
      const msg: WorkerResponse = {
        type: 'error',
        message: err instanceof Error ? err.message : 'Unknown error',
      };
      self.postMessage(msg);
    }
  }
};
