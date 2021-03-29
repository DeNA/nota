import React from "react";
import { Row, Col, Container } from "react-bootstrap";
import { fetchAvailableTasks } from "../lib/api";
import { apiContainerFactory } from "../lib/apiContainerFactory";
import Loading from "./Loading";
import DashboardProject from "./DashboardProject";

const Dashboard = function({ resource: projects, loading, doGet }) {
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
          <h2>アノテーション</h2>
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
