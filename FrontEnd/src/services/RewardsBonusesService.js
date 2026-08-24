import apiClient from "../apiConfig";

// Get employee rewards, bonuses, and overtime history
export const getEmployeeRewards = () =>
  apiClient.get(`/employee/rewards`);

// Get employee recognitions received & sent
export const getEmployeeRecognitions = () =>
  apiClient.get(`/employee/recognitions`);

// Send a new recognition to a colleague
export const sendRecognition = (payload) =>
  apiClient.post(`/employee/recognitions`, payload);

// Get list of active colleagues to send recognition to
export const getColleagues = () =>
  apiClient.get(`/employee/chats/contacts`);

