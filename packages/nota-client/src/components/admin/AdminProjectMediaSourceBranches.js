import React from "react";
import { Card, Nav, Container, Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { fetchMediaItemsTree } from "../../lib/api";
import { apiContainerFactory } from "../../lib/apiContainerFactory";
import Loading from "../Loading";

export function AdminProjectMediaSourceBranches({ resource: tree, loading }) {
  const { t } = useTranslation();
  const total = React.useMemo(() => {
    return (tree || []).reduce((total, branch) => {
      return total + branch.files;
    }, 0);
  }, [tree]);

  return (
    <Card className="w-100">
      {loading && <Loading />}
      <Card.Header>
        <Nav className="justify-content-between">
          <Nav.Item>
            <h3>{t("folders")}</h3>
          </Nav.Item>
        </Nav>
      </Card.Header>
      <Card.Body>
        <Container>
          <Row key="-1">
            <Col>
              <h4>{t("path")}</h4>
            </Col>
            <Col>
              <h4>{t("media-files")}</h4>
            </Col>
          </Row>
          {(tree || [])
            .filter(branch => branch.files > 0)
            .map(branch => (
              <Row key={branch.path}>
                <Col>
                  <code>{branch.path}</code>
                </Col>
                <Col>{branch.files}</Col>
              </Row>
            ))}
          <Row key="-2">
            <Col>
              <h4>{t("total")}</h4>
            </Col>
            <Col>
              <h4>{total}</h4>
            </Col>
          </Row>
        </Container>
      </Card.Body>
    </Card>
  );
}

export default apiContainerFactory(
  AdminProjectMediaSourceBranches,
  fetchMediaItemsTree
);
