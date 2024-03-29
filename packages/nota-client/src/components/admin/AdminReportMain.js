import moment from "moment";
import React from "react";
import { Button, Col, Container, Nav, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { withRouter } from "react-router";
import { LinkContainer } from "react-router-bootstrap";
import { Redirect, Route, Switch } from "react-router-dom";
import history from "../../lib/history";
import AdminReportAnnotatorsTasksReport from "./AdminReportAnnotatorsTasksReport";
import "./AdminReportMain.css";
import AdminReportStatusReport from "./AdminReportStatusReport";
import AdminReportTasksAnnotatorsReport from "./AdminReportTasksAnnotatorsReport";

const getParam = function(param, search = "") {
  const match = search.match(`[?&]${param}=([^&]+)`);

  return match ? match[1] : null;
};

const getLocation = function(currentLocation, periodStart) {
  return `${currentLocation.pathname}?start=${periodStart.format("YYYYMMDD")}`;
};

const AdminReportMain = function({ match, location }) {
  const { t } = useTranslation();
  const periodStartParam = getParam("start", location.search);
  let periodStart = moment(periodStartParam, "YYYYMMDD");
  const today = React.useRef(moment());

  if (!periodStart.isValid()) {
    periodStart = moment().isoWeekday(1);
  }

  const changePeriod = function(offset) {
    history.push(getLocation(location, periodStart.clone().add(offset, "w")));
  };

  const dates = [
    periodStart.clone(),
    periodStart.clone().isoWeekday(2),
    periodStart.clone().isoWeekday(3),
    periodStart.clone().isoWeekday(4),
    periodStart.clone().isoWeekday(5),
    periodStart.clone().isoWeekday(6),
    periodStart.clone().isoWeekday(7)
  ];

  return (
    <Container fluid className="h-100 bg-light reports-main pt-3">
      <Row className="h-100">
        <Col className="h-100">
          <h2>{t("report")}</h2>
          <Row className="flex-row justify-content-between align-items-end">
            <Col>
              <Nav variant="tabs" activeKey={location.pathname}>
                <Nav.Item>
                  <LinkContainer to={`/admin/report/status${location.search}`}>
                    <Nav.Link eventKey="/admin/report/status">
                      {t("project-task")}
                    </Nav.Link>
                  </LinkContainer>
                </Nav.Item>
                <Nav.Item>
                  <LinkContainer
                    to={`/admin/report/taskAnnotator${location.search}`}
                  >
                    <Nav.Link eventKey="/admin/report/taskAnnotator">
                      {t("task-annotator")}
                    </Nav.Link>
                  </LinkContainer>
                </Nav.Item>
                <Nav.Item>
                  <LinkContainer
                    to={`/admin/report/annotatorTask${location.search}`}
                  >
                    <Nav.Link eventKey="/admin/report/annotatorTask">
                      {t("annotator-task")}
                    </Nav.Link>
                  </LinkContainer>
                </Nav.Item>
              </Nav>
            </Col>
            <Col className="d-flex justify-content-end mb-1">
              <Button
                size="sm"
                variant="info"
                onClick={() => history.push(location.pathname)}
                className="mr-3"
              >
                {t("today")}
              </Button>
              <Button
                size="sm"
                variant="info"
                onClick={() => changePeriod(-1)}
              >{`<<<`}</Button>
              <h4 className="d-flex justify-content-center align-items-center pl-3 pr-3 m-0">
                {`${dates[0].format("YYYY-MM-DD")} - ${dates[6].format(
                  "YYYY-MM-DD"
                )}`}
              </h4>
              <Button
                size="sm"
                variant="info"
                onClick={() => changePeriod(1)}
              >{`>>>`}</Button>
            </Col>
          </Row>
          <Row>
            <Col>
              <Switch>
                <Route
                  exact
                  path="/admin/report/status"
                  render={props => (
                    <AdminReportStatusReport
                      {...props}
                      dates={dates}
                      today={today.current}
                    />
                  )}
                />
                <Route
                  exact
                  path="/admin/report/taskAnnotator"
                  render={props => (
                    <AdminReportTasksAnnotatorsReport
                      {...props}
                      dates={dates}
                      today={today.current}
                    />
                  )}
                />
                <Route
                  exact
                  path="/admin/report/annotatorTask"
                  render={props => (
                    <AdminReportAnnotatorsTasksReport
                      {...props}
                      dates={dates}
                      today={today.current}
                    />
                  )}
                />
                <Redirect to="/admin/report/status" />
              </Switch>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default withRouter(AdminReportMain);
