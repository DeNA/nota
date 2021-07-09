import React from "react";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { LinkContainer } from "react-router-bootstrap";
import logo from "../logo@2x.png";

const NavigationBar = function({
  username,
  showAdmin,
  showUserAdmin,
  showReport
}) {
  const { t } = useTranslation();
  const activeKey = window.location.pathname.startsWith("/admin/users")
    ? "userAdmin"
    : window.location.pathname.startsWith("/admin/report")
    ? "report"
    : window.location.pathname.startsWith("/admin")
    ? "projectAdmin"
    : "annotation";

  return (
    <Navbar bg="dark" variant="dark" fixed="top" className="shadow-sm">
      <LinkContainer to="/" isActive={() => activeKey === "annotation"}>
        <Navbar.Brand className="pt-0 pb-0">
          <img
            src={logo}
            alt={t("nota")}
            title={t("nota")}
            width="30"
            height="30"
          />
        </Navbar.Brand>
      </LinkContainer>
      <Nav className="mr-auto">
        <Nav.Item>
          <LinkContainer to="/" isActive={() => activeKey === "annotation"}>
            <Nav.Link>{t("annotation")}</Nav.Link>
          </LinkContainer>
        </Nav.Item>
        {showAdmin && (
          <Nav.Item>
            <LinkContainer
              to="/admin"
              isActive={() => activeKey === "projectAdmin"}
            >
              <Nav.Link>{t("project-management")}</Nav.Link>
            </LinkContainer>
          </Nav.Item>
        )}{" "}
        {showReport && (
          <Nav.Item>
            <LinkContainer
              to="/admin/report/status"
              isActive={() => activeKey === "report"}
            >
              <Nav.Link>{t("report")}</Nav.Link>
            </LinkContainer>
          </Nav.Item>
        )}
        {showUserAdmin && (
          <Nav.Item>
            <LinkContainer
              to="/admin/users"
              isActive={() => activeKey === "userAdmin"}
            >
              <Nav.Link>{t("user-management")}</Nav.Link>
            </LinkContainer>
          </Nav.Item>
        )}
      </Nav>
      <Nav>
        <NavDropdown id="user-menu" title={username} alignRight>
          <LinkContainer to="/logout">
            <NavDropdown.Item>{t("sign-out")}</NavDropdown.Item>
          </LinkContainer>
        </NavDropdown>
      </Nav>
    </Navbar>
  );
};

export default NavigationBar;
