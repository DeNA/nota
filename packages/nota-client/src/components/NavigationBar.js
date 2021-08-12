import React from "react";
import { Form, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { LinkContainer } from "react-router-bootstrap";
import i18n from "../i18n";
import logo from "../logo@2x.png";
import Icon from "./Icon";

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
  const handleLanguageSelection = evt => {
    i18n.changeLanguage(evt.target.value);
  };

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
        <Form.Group className="mb-0 pr-5">
          <Form.Control
            as="select"
            className="bg-dark text-secondary"
            size="sm"
            onChange={handleLanguageSelection}
            value={i18n.language.split("-")[0]}
          >
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </Form.Control>
        </Form.Group>
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
