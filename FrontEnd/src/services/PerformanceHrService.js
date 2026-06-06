import apiClient from "../apiConfig";

export const getListCycle=()=>
    apiClient.get("/performance/cycles")