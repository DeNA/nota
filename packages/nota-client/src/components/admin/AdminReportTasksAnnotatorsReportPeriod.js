import React from "react";
import Loading from "../Loading";
import { fetchTasksAnnotatorsReportPeriod } from "../../lib/api";

const AdminReportTasksAnnotatorsReportPeriod = function({
  label,
  from,
  to,
  tz,
  tasksReference
}) {
  const [loading, setLoading] = React.useState(true);
  const [statusReport, setStatusReport] = React.useState(null);

  React.useEffect(() => {
    const getReport = async function() {
      const response = await fetchTasksAnnotatorsReportPeriod({ from, to, tz });
      setStatusReport(response);
      setLoading(false);
    };
    getReport();
  }, [from, to, tz]);

  if (loading && !statusReport) {
    return <Loading />;
  }

  const reportData = {};

  statusReport.completed.forEach(task => {
    const key = `${task.annotatorId}_${task.id}`;
    const data = (reportData[key] = reportData[key] || {});

    data.completed = task.count;
  });

  return (
    <>
      <div className="report-header report-header-row d-flex justify-content-center align-items-center">
        {label}
      </div>
      {tasksReference.map(taskReference => {
        const key = `${taskReference.annotatorId}_${taskReference.id}`;
        const data = reportData[key];

        return (
          <div key={key} className="report-row report-cell">
            {data ? <div>{data.completed || 0}</div> : "--"}
          </div>
        );
      })}
    </>
  );
};

export default AdminReportTasksAnnotatorsReportPeriod;
