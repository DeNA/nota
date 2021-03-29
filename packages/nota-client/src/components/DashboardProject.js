import React from "react";
import DashboardProjectTask from "./DashboardProjectTask";

const DashboardProject = function({ project, reload }) {
  return (
    <>
      {project.tasks.map(task => (
        <DashboardProjectTask
          key={task.id}
          project={project}
          task={task}
          reload={reload}
        />
      ))}
    </>
  );
};

export default DashboardProject;
