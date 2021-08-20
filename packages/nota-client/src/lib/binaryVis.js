import * as cache from "./cache";
import { fetchTaskItemVis } from "./api";

export const getVis = async function(projectId, taskId, taskItemId) {
  const key = `vis_${projectId}_${taskId}_${taskItemId}`;

  const promise =
    cache.get(key) ||
    fetchTaskItemVis({
      projectId,
      taskId,
      taskItemId
    });

  cache.add(key, promise);

  try {
    const binarySidecar = await promise;

    return binarySidecar;
  } catch (error) {
    cache.remove(key);
    throw error;
  }
};
