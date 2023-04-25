import axios from "axios";

const API_BASEURL = "http://localhost:5000";

async function httpGetPlanets() {
  // Load planets and return as JSON.
  const response = await axios.get(`${API_BASEURL}/planets`);
  return response.data;
}

async function httpGetLaunches() {
  // Load launches, sort by flight number, and return as JSON.
  const response = await axios.get(`${API_BASEURL}/launches`);
  const fetchedLaunches = response.data.sort((a, b) => a - b);
  return fetchedLaunches;
}

async function httpSubmitLaunch(launch) {
  // Submit given launch data to launch system.
  try {
    const response = await axios.post(`${API_BASEURL}/launches`, launch, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    return error;
  }
}

async function httpAbortLaunch(id) {
  try {
    const response = await axios.delete(`${API_BASEURL}/launches/${id}`);
    return response;
  } catch (error) {
    return error;
  }
}

export { httpGetPlanets, httpGetLaunches, httpSubmitLaunch, httpAbortLaunch };
