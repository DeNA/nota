import React from "react";
import { Table, Row, Col, Container } from "react-bootstrap";
import { apiContainerFactory } from "../../lib/apiContainerFactory";
import { fetchUsers } from "../../lib/api";
import Loading from "../Loading";
import AdminUsersUser from "./AdminUsersUser";
import { useTranslation } from "react-i18next";

const AdminUsers = function({ resource: users, doGet, loading }) {
  const { t } = useTranslation();
  if (loading && !users) {
    return <Loading global />;
  }

  return (
    <Container className="h-100 bg-light">
      {loading && <Loading />}
      <Row className="h-100">
        <Col className="h-100">
          <h2>{t("user-management")}</h2>
          <Table striped>
            <thead>
              <tr>
                <th>{t("id")}</th>
                <th>{t("login-username")}</th>
                <th>{t("status")}</th>
                <th>{t("login-method")}</th>
                <th>{t("permission-groups")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <AdminUsersUser key={user.id} user={user} reload={doGet} />
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default apiContainerFactory(AdminUsers, fetchUsers);
