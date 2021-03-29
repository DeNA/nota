import React from "react";
import { Table, Row, Col, Container } from "react-bootstrap";
import { apiContainerFactory } from "../../lib/apiContainerFactory";
import { fetchUsers } from "../../lib/api";
import Loading from "../Loading";
import AdminUsersUser from "./AdminUsersUser";

const AdminUsers = function({ resource: users, doGet, loading }) {
  if (loading && !users) {
    return <Loading global />;
  }

  return (
    <Container className="h-100 bg-light">
      {loading && <Loading />}
      <Row className="h-100">
        <Col className="h-100">
          <h2>Users</h2>
          <Table striped>
            <thead>
              <tr>
                <th>Id</th>
                <th>Username</th>
                <th>Status</th>
                <th>Login Method</th>
                <th>Groups</th>
                <th>Actions</th>
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
