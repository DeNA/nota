import React from "react";
import { Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { updateUser } from "../../lib/api";
import { User } from "../../lib/models";
import MeContext from "../MeContext";
import GroupsEdit from "./GroupsEdit";

const AdminUsersUser = function({ user, reload }) {
  const { t } = useTranslation();
  const [updating, setUpdating] = React.useState(false);
  const [updatedStatus, setUpdatedStatus] = React.useState(null);
  const [updatedUserGroups, setUpdatedUserGroups] = React.useState(null);
  const me = React.useContext(MeContext);
  const hasChanged = updatedStatus !== null || updatedUserGroups !== null;

  const handleStatusChange = function(evt) {
    const value = parseInt(evt.target.value);
    const newStatus = value === user.status ? null : value;
    setUpdatedStatus(newStatus);
  };

  const handleUserGroupsChange = function(groups) {
    setUpdatedUserGroups(groups);
  };

  const handleSave = async function() {
    if (!hasChanged) return;

    setUpdating(true);
    await updateUser({
      user: {
        id: user.id,
        status: updatedStatus !== null ? updatedStatus : undefined,
        groups: updatedUserGroups || undefined
      }
    });
    handleCancel();
    setUpdating(false);
    reload();
  };

  const handleCancel = function() {
    setUpdatedStatus(null);
    setUpdatedUserGroups(null);
  };

  const generateStatus = function(user) {
    return (
      <Form.Control
        size="sm"
        style={{ width: 200 }}
        as="select"
        value={updatedStatus !== null ? updatedStatus : user.status}
        onChange={handleStatusChange}
        disabled={
          updating ||
          (user.status === User.STATUS.APP_ADMIN && !me.isAppAdmin) ||
          user.id === me.id
        }
      >
        <option value={User.STATUS.NOT_READY_DELETED}>
          {t("inactive-user")}
        </option>
        <option value={User.STATUS.ACTIVE}>{t("normal-user")}</option>
        <option value={User.STATUS.SUPER_ADMIN}>{t("super-admin-user")}</option>
        <option value={User.STATUS.APP_ADMIN} disabled={!me.isAppAdmin}>
          {t("app-admin-user")}
        </option>
      </Form.Control>
    );
  };

  return (
    <>
      <tr>
        <td>{user.id}</td>
        <td>{user.username}</td>
        <td>{generateStatus(user)}</td>
        <td>{user.authenticator}</td>
        <td>
          <GroupsEdit
            disabled={updating}
            groups={updatedUserGroups || user.groups}
            onChange={handleUserGroupsChange}
          />
        </td>
        <td>
          <Button
            size="sm"
            disabled={!hasChanged}
            variant={hasChanged ? "success" : "secondary"}
            onClick={handleSave}
          >
            {t("save-button")}
          </Button>{" "}
          <Button
            size="sm"
            disabled={!hasChanged}
            variant="secondary"
            onClick={handleCancel}
          >
            {t("cancel-button")}
          </Button>
        </td>
      </tr>
    </>
  );
};

export default AdminUsersUser;
