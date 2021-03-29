import React from "react";
import { fetchTaskStatusReportPeriod } from "../../lib/api";
import Loading from "../Loading";

const AdminReportStatusReportPeriod = function({
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
      const response = await fetchTaskStatusReportPeriod({ from, to, tz });
      setStatusReport(response);
      setLoading(false);
    };
    getReport();
  }, [from, to, tz]);

  if (loading && !statusReport) {
    return <Loading />;
  }

  const reportData = {};

  statusReport.total.forEach(task => {
    const data = (reportData[task.taskId] = reportData[task.taskId] || {});

    data.total = task.count;
  });

  statusReport.totalCompleted.forEach(task => {
    const data = (reportData[task.taskId] = reportData[task.taskId] || {});

    data.totalCompleted = task.count;
  });

  statusReport.added.forEach(task => {
    const data = (reportData[task.taskId] = reportData[task.taskId] || {});

    data.added = task.count;
  });

  statusReport.completed.forEach(task => {
    const data = (reportData[task.taskId] = reportData[task.taskId] || {});

    data.completed = task.count;
  });

  return (
    <>
      <div className="report-header report-header-row d-flex justify-content-center align-items-center">
        {label}
      </div>
      {tasksReference.map(taskReference => {
        const data = reportData[taskReference.id];

        return (
          <div key={taskReference.id} className="report-row report-cell">
            {data ? (
              <>
                <div>
                  {data.totalCompleted || 0}/{data.total || 0}
                </div>
                <small>
                  <span className={data.completed > 0 ? "positive" : ""}>
                    +{data.completed || 0}
                  </span>
                  <span>/</span>
                  <span className={data.added > 0 ? "positive" : ""}>
                    +{data.added || 0}
                  </span>
                </small>
              </>
            ) : (
              "--"
            )}
          </div>
        );
      })}
    </>
  );
};

export default AdminReportStatusReportPeriod;
