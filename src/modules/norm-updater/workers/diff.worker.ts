// src/modules/norm-updater/workers/diff.worker.ts
import { Diff, diffLines } from 'diff';

self.onmessage = ({ data: { oldText, newText } }) => {
  const changes = diffLines(oldText, newText);
  postMessage(changes);
};
export {};
