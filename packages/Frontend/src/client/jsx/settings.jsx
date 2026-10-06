import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import SettingsPage, {
  NotificationsCard,
} from "../../component/jsx/settings-page.jsx";
import {
  getSettings,
  changePassword,
  updateNotifications,
  deactivateAccount,
} from "../api/settings";
// Same stylesheet the Profile page uses, so this page gets exactly the same
// page width / height rules (profile-page + profile-container).
import "../css/profile.css";

function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <SettingsPage
      headerVariant="client"
      pageClass="profile-page"
      mainClass="profile-container"
      eyebrowClass="profile-eyebrow"
      profilePath="/profile"
      displayName={user?.name}
      displayEmail={user?.email}
      api={{
        load: getSettings,
        changePassword,
        deactivate: deactivateAccount,
      }}
      onSignOut={signOut}
      renderSideCard={(settings, patchSettings) => (
        <NotificationsCard
          settings={settings}
          onSave={async (next) => {
            await updateNotifications(next);
            patchSettings({ email_notifications: next });
          }}
        />
      )}
    />
  );
}

export default Settings;
