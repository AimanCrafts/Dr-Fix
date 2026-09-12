import api from "./axios";

/**
 * technician/api/auth.js
 * -------------------------
 * register() posts multipart/form-data (not JSON) because it includes
 * the NID file upload — axios sets the correct multipart boundary
 * automatically when given a FormData body, so no manual Content-Type
 * header is set here.
 *
 * No verifyOtp/resendOtp here — technician identity is verified by
 * admin review of the NID upload instead of email OTP. See
 * TechnicianAuthController::register on the backend.
 */

export const registerTechnician = (form) => {
  const formData = new FormData();
  formData.append("fullName", form.fullName);
  formData.append("email", form.email);
  formData.append("phone", form.phone);
  formData.append("password", form.password);
  formData.append("password_confirmation", form.confirmPassword);
  formData.append("serviceCategory", form.serviceCategory);
  formData.append("yearsOfExperience", form.yearsOfExperience);
  formData.append("workArea", form.workArea);
  if (form.nidFile) {
    formData.append("nidFile", form.nidFile);
  }

  return api.post("/technician/register", formData);
};

export const loginTechnician = (identifier, password) =>
  api.post("/technician/login", { identifier, password });

export const logoutTechnician = () => api.post("/technician/logout");

export const getCurrentTechnician = () => api.get("/technician/me");
