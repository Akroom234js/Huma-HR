import apiClient from "../apiConfig";

//
export const getEmployeeRewards = () =>
  apiClient.get(`/employee/rewards`);


export const getEmployeeRecognitions = () =>
  apiClient.get(`/employee/recognitions`);

// export const getAllEmployee = () =>
//    apiClient.get(`/employee/chats/contacts`);
