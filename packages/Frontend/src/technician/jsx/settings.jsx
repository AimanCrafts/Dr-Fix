import { useNavigate } from "react-router-dom";
import SettingsPage, {
  JobPreferencesCard,
} from "../../component/jsx/settings-page.jsx";
import {
  getTechnicianSettings,
  changeTechnicianPassword,
  deactivateTechnicianAccount,
  deleteTechnicianAccount,
} from "../api/settings-api";
import DeleteAccountCard from "./delete-account.jsx";
import { updateTechnicianAvailability } from "../api/technician-dashboard-api";
// Same stylesheet the technician Profile page uses (tech-page layout).
import "../css/profile.css";
import "../css/technician-design-system.css";

function readTechnician() {
  try {
    return JSON.parse(localStorage.getItem("technician_user")) || {};
  } catch {
    return {};
  }
}

function TechnicianSettings() {
  const navigate = useNavigate();
  const technician = readTechnician();

  const signOut = () => {
    localStorage.removeItem("technician_token");
    localStorage.removeItem("technician_user");
    navigate("/technician/login");
  };

  return (
    <SettingsPage
      headerVariant="technician"
      pageClass="tech-page"
      mainClass="tech-page__main"
      profilePath="/technician/profile"
      displayName={technician.name}
      displayEmail={technician.email}
      api={{
        load: getTechnicianSettings,
        changePassword: changeTechnicianPassword,
        deactivate: deactivateTechnicianAccount,
      }}
      onSignOut={signOut}
      renderSideCard={(settings, patchSettings) => (
        <>
          <JobPreferencesCard
            settings={settings}
            onToggleAvailability={async (next) => {
              await updateTechnicianAvailability(next);
              patchSettings({ is_available: next });
            }}
          />
          <DeleteAccountCard
            deleteAccount={deleteTechnicianAccount}
            onDeleted={signOut}
          />
        </>
      )}
    />
  );
}

export default TechnicianSettings;
