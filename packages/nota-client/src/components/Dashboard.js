import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { fetchAvailableTasks } from "../lib/api";
import { apiContainerFactory } from "../lib/apiContainerFactory";
import DashboardProject from "./DashboardProject";
import Loading from "./Loading";

const Dashboard = function({ resource: projects, loading, doGet }) {
  const { t } = useTranslation();
  if (loading && !projects) {
    return <Loading />;
  }

  return (
    <Container
      className="text-light h-100 pt-3"
      style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
      fluid
    >
      {loading && <Loading />}
      <Row>
        <Col>
          <h2>{t("annotation")}</h2>
          {projects.map(project => (
            <DashboardProject
              key={project.id}
              project={project}
              reload={doGet}
            />
          ))}
        </Col>
      </Row>
    </Container>
  );
};

export default apiContainerFactory(Dashboard, fetchAvailableTasks);
