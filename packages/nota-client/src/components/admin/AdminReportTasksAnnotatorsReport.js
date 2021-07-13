import React from "react";
import { apiContainerFactory } from "../../lib/apiContainerFactory";
import { fetchReportTasksAnnotatorsReference } from "../../lib/api";
import Loading from "../Loading";
import AdminReportTasksAnnotatorsReportPeriod from "./AdminReportTasksAnnotatorsReportPeriod";
import { useTranslation } from "react-i18next";

const AdminReportTasksAnnotatorsReport = function({
  resource: tasksReference,
  doGet,
  loading,
  dates,
  today
}) {
  const { t } = useTranslation();
  if (loading && !tasksReference) {
    return <Loading />;
  }

  return (
    <div className="report-container">
      <div className="report-column report-header-column">
        <div className="report-header report-header-row d-flex justify-content-center align-items-center">
          {t("task-annotator")}
        </div>
        {tasksReference.map(taskReference => (
          <div
            key={taskReference.id}
            className="report-row d-flex-column justify-content-start align-items-center"
          >
            <div className="text-nowrap text-truncate">
              <b>
                {taskReference.projectName} / {taskReference.name}
              </b>
            </div>
            <div className="text-nowrap text-truncate">
              {taskReference.annotatorUsername}
            </div>
          </div>
        ))}
      </div>
      {dates.map(date => {
        const dateString = date.format("YYYYMMDD");
        const active = date.isSame(today, "day");
        return (
          <div
            key={dateString}
            className={`report-column ${active && "active"}`}
          >
            <AdminReportTasksAnnotatorsReportPeriod
              label={date.format("YYYY-MM-DD")}
              from={`${dateString}000000`}
              to={`${dateString}235959`}
              tz={Intl.DateTimeFormat().resolvedOptions().timeZone}
              tasksReference={tasksReference}
            />
          </div>
        );
      })}
    </div>
  );
};

export default apiContainerFactory(
  AdminReportTasksAnnotatorsReport,
  fetchReportTasksAnnotatorsReference
);
