import axios from "axios";
const API = axios.create({ baseURL: "http://127.0.0.1:8000" });

export async function listJobs() {
  const resp = await API.get("/jobs/");
  return resp.data;
}

export async function getQuestions(jobId: number) {
  const resp = await API.get(`/jobs/${jobId}/questions`);
  return resp.data.questions;
}

export async function applyToJob(formData: FormData) {
  const resp = await API.post("/applications/apply", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return resp.data;
}

export async function createJob(payload: { title: string; description: string; requirements: string }) {
  const resp = await API.post("/jobs/", payload);
  return resp.data;
}

export async function deleteJob(jobId: number) {
  const resp = await API.delete(`/jobs/${jobId}`);
  return resp.data;
}

export async function getApplicationsForJob(jobId: number) {
  const resp = await API.get(`/applications/job/${jobId}`);
  return resp.data;
}
