import { base64ArrayBuffer } from "./encodeUtils";
import history from "./history";

export async function fetch(input, init = {}) {
  try {
    init.headers = init.headers || new Headers();
    const response = await window.fetch(input, init);

    if (response.ok) {
      const contentType = response.headers.has("content-type")
        ? response.headers.get("content-type").split(";")[0]
        : "";

      if (contentType.startsWith("image/")) {
        const buffer = await response.arrayBuffer();
        const encoded = base64ArrayBuffer(buffer);
        return `data:${contentType};base64,${encoded}`;
      } else if (contentType.startsWith("application/json")) {
        return response.json();
      } else if (contentType.startsWith("application/gzip")) {
        return response;
      } else if (contentType.startsWith("text/csv")) {
        return response;
      } else {
        return null;
      }
    } else if (response.status === 401) {
      history.push(
        `/login?from=${encodeURIComponent(window.location.pathname)}`
      );
    } else {
      const message = await response.json();
      if (message && message.message) {
        throw new Error(message.message);
      }

      throw new Error("Problem with request");
    }
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
}

export async function fetchMe() {
  return await fetch("/api/users/me");
}

export async function fetchAuthenticators() {
  return await fetch("/auth/authenticators");
}

export async function fetchProjects() {
  return await fetch("/api/projects");
}

export async function fetchProject({ projectId }) {
  return await fetch(`/api/projects/${projectId}`);
}

export async function persistProject({ project }) {
  return await fetch(`/api/projects`, {
    method: "post",
    body: JSON.stringify(project),
    headers: new Headers({
      "content-type": "application/json"
    })
  });
}

export async function fetchTasks({ projectId }) {
  return await fetch(`/api/projects/${projectId}/tasks`);
}

export async function fetchTask({ projectId, taskId }) {
  return await fetch(`/api/projects/${projectId}/tasks/${taskId}`);
}

export async function fetchMediaSources({ projectId }) {
  return await fetch(`/api/projects/${projectId}/mediaSources`);
}

export async function fetchMediaSource({ projectId, mediaSourceId }) {
  return await fetch(
    `/api/projects/${projectId}/mediaSources/${mediaSourceId}`
  );
}

export async function updateMediaSource({ projectId, mediaSource }) {
  return await fetch(
    `/api/projects/${projectId}/mediaSources/${mediaSource.id}`,
    {
      method: "put",
      body: JSON.stringify(mediaSource),
      headers: new Headers({
        "content-type": "application/json"
      })
    }
  );
}

export async function persistMediaSource({ projectId, mediaSource }) {
  return await fetch(`/api/projects/${projectId}/mediaSources`, {
    method: "post",
    body: JSON.stringify(mediaSource),
    headers: new Headers({
      "content-type": "application/json"
    })
  });
}

export async function refreshMediaItems({ projectId, mediaSourceId }) {
  return await fetch(
    `/api/projects/${projectId}/mediaSources/${mediaSourceId}/refreshMediaItems`,
    {
      method: "post",
      headers: new Headers({
        "content-type": "application/json"
      })
    }
  );
}

export async function countMediaItems({
  projectId,
  mediaSourceId,
  options,
  conditions
}) {
  return await fetch(
    `/api/projects/${projectId}/mediaSources/${mediaSourceId}/countMediaItems`,
    {
      method: "post",
      headers: new Headers({
        "content-type": "application/json"
      }),
      body: JSON.stringify({ options, conditions })
    }
  );
}

export async function fetchMediaItemsTree({ projectId, mediaSourceId }) {
  return await fetch(
    `/api/projects/${projectId}/mediaSources/${mediaSourceId}/tree`
  );
}

export async function fetchTaskAssignment({
  projectId,
  taskId,
  taskAssignmentId
}) {
  return await fetch(
    `/api/projects/${projectId}/tasks/${taskId}/taskAssignments/${taskAssignmentId}`
  );
}

export async function fetchTaskItemVis({ projectId, taskId, taskItemId }) {
  return await fetch(
    `/api/projects/${projectId}/tasks/${taskId}/taskItems/${taskItemId}/vis`
  );
}

export async function persistTask({
  name,
  description,
  projectId,
  mediaSourceId,
  options,
  conditions
}) {
  return await fetch(`/api/projects/${projectId}/tasks`, {
    method: "post",
    body: JSON.stringify({
      name,
      description,
      projectId,
      mediaSourceId,
      options,
      conditions
    }),
    headers: new Headers({
      "content-type": "application/json"
    })
  });
}

export async function updateTask({ projectId, task }) {
  return await fetch(`/api/projects/${projectId}/tasks/${task.id}`, {
    method: "put",
    body: JSON.stringify(task),
    headers: new Headers({
      "content-type": "application/json"
    })
  });
}

export async function refreshTaskItems({ projectId, taskId }) {
  return await fetch(
    `/api/projects/${projectId}/tasks/${taskId}/refreshTaskItems`,
    {
      method: "post",
      headers: new Headers({
        "content-type": "application/json"
      })
    }
  );
}

export async function performTaskMaintenance({
  projectId,
  taskId,
  maintenance
}) {
  return await fetch(`/api/projects/${projectId}/tasks/${taskId}/maintenance`, {
    method: "post",
    body: JSON.stringify(maintenance),
    headers: new Headers({
      "content-type": "application/json"
    })
  });
}

export async function deleteTask({ projectId, taskId }) {
  return await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
    method: "delete",
    headers: new Headers({
      "content-type": "application/json"
    })
  });
}

export async function fetchAvailableTasks() {
  return await fetch(`/api/projects/available`);
}

export async function fetchProjectAssignableUsers({ projectId }) {
  return await fetch(`/api/projects/${projectId}/assignableUsers`);
}

export async function persistTaskAssignment({ projectId, taskId, options }) {
  return await fetch(
    `/api/projects/${projectId}/tasks/${taskId}/taskAssignments`,
    {
      method: "post",
      body: JSON.stringify(options),
      headers: new Headers({
        "content-type": "application/json"
      })
    }
  );
}

export async function returnUnfinishedTaskItems({
  projectId,
  taskId,
  taskAssignmentId
}) {
  return await fetch(
    `/api/projects/${projectId}/tasks/${taskId}/taskAssignments/${taskAssignmentId}/returnUnfinishedTaskItems`,
    {
      method: "post",
      body: null,
      headers: new Headers({
        "content-type": "application/json"
      })
    }
  );
}

export async function updateTaskAssignment({
  projectId,
  taskId,
  taskAssignment
}) {
  return await fetch(
    `/api/projects/${projectId}/tasks/${taskId}/taskAssignments/${
      taskAssignment.id
    }`,
    {
      method: "put",
      body: JSON.stringify(taskAssignment),
      headers: new Headers({
        "content-type": "application/json"
      })
    }
  );
}

export async function persistAnnotation({
  projectId,
  taskId,
  taskItemId,
  annotation
}) {
  return await fetch(
    `/api/projects/${projectId}/tasks/${taskId}/taskItems/${taskItemId}/annotations`,
    {
      method: "post",
      body: JSON.stringify(annotation),
      headers: new Headers({
        "content-type": "application/json"
      })
    }
  );
}

export async function updateAnnotation({
  projectId,
  taskId,
  taskItemId,
  annotation
}) {
  return await fetch(
    `/api/projects/${projectId}/tasks/${taskId}/taskItems/${taskItemId}/annotations/${
      annotation.id
    }`,
    {
      method: "put",
      body: JSON.stringify(annotation),
      headers: new Headers({
        "content-type": "application/json"
      })
    }
  );
}

export async function deleteAnnotation({
  projectId,
  taskId,
  taskItemId,
  annotationId
}) {
  return await fetch(
    `/api/projects/${projectId}/tasks/${taskId}/taskItems/${taskItemId}/annotations/${annotationId}`,
    {
      method: "delete",
      headers: new Headers({
        "content-type": "application/json"
      })
    }
  );
}

export async function updateTaskItem({ projectId, taskId, taskItem }) {
  return await fetch(
    `/api/projects/${projectId}/tasks/${taskId}/taskItems/${taskItem.id}`,
    {
      method: "put",
      body: JSON.stringify(taskItem),
      headers: new Headers({
        "content-type": "application/json"
      })
    }
  );
}

export async function fetchUsers() {
  return await fetch("/api/users");
}

export async function updateUser({ user }) {
  return await fetch(`/api/users/${user.id}`, {
    method: "put",
    body: JSON.stringify(user),
    headers: new Headers({
      "content-type": "application/json"
    })
  });
}

export async function updateProject({ project }) {
  return await fetch(`/api/projects/${project.id}`, {
    method: "put",
    body: JSON.stringify(project),
    headers: new Headers({
      "content-type": "application/json"
    })
  });
}

export async function fetchTemplate({ projectId, taskTemplateId }) {
  return await fetch(
    `/api/projects/${projectId}/taskTemplates/${taskTemplateId}`
  );
}

export async function fetchTemplates({ projectId }) {
  return await fetch(`/api/projects/${projectId}/taskTemplates`);
}

export async function persistTemplate({ projectId, taskTemplate }) {
  return await fetch(`/api/projects/${projectId}/taskTemplates`, {
    method: "post",
    body: JSON.stringify(taskTemplate),
    headers: new Headers({
      "content-type": "application/json"
    })
  });
}

export async function updateTemplate({ projectId, taskTemplate }) {
  return await fetch(
    `/api/projects/${projectId}/taskTemplates/${taskTemplate.id}`,
    {
      method: "put",
      body: JSON.stringify(taskTemplate),
      headers: new Headers({
        "content-type": "application/json"
      })
    }
  );
}

export async function exportTaskResults({ projectId, taskId, options = {} }) {
  return await fetch(`/api/projects/${projectId}/tasks/${taskId}/export`, {
    method: "post",
    body: JSON.stringify(options),
    headers: new Headers({
      "content-type": "application/json"
    })
  });
}

export async function resetTaskItem({ projectId, taskId, taskItemId }) {
  return await fetch(
    `/api/projects/${projectId}/tasks/${taskId}/taskItems/${taskItemId}/reset`,
    {
      method: "post",
      body: "",
      headers: new Headers({
        "content-type": "application/json"
      })
    }
  );
}

// REPORT
export async function fetchReportTasksReference() {
  return await fetch(`/api/reports/reference/tasks`);
}
export async function fetchTaskStatusReportPeriod({ from, to, tz }) {
  return await fetch(`/api/reports/tasksStatus?from=${from}&to=${to}&tz=${tz}`);
}
export async function fetchReportTasksAnnotatorsReference() {
  return await fetch(`/api/reports/reference/tasksAnnotators`);
}
export async function fetchTasksAnnotatorsReportPeriod({ from, to, tz }) {
  return await fetch(
    `/api/reports/tasksAnnotators?from=${from}&to=${to}&tz=${tz}`
  );
}
export async function fetchReportAnnotatorsTasksReference() {
  return await fetch(`/api/reports/reference/annotatorsTasks`);
}
export async function fetchAnnotatorsTasksReportPeriod({ from, to, tz }) {
  return await fetch(
    `/api/reports/annotatorsTasks?from=${from}&to=${to}&tz=${tz}`
  );
}

// OLD METHODS
// Admin only
export async function executeFolderHook(folderId, hook) {
  return await fetch(`/api/folders/${folderId}/hook`, {
    method: "post",
    body: JSON.stringify({ hook }),
    headers: new Headers({
      "content-type": "application/json"
    })
  });
}
