import axios from 'axios';

// The base URL for our Spring Boot backend
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// We use an interceptor to automatically add the auth token to every request.
// This is much cleaner than adding the header manually for each API call.
apiClient.interceptors.request.use(
  (config) => {
    // Get the stored credentials from localStorage
    const credentials = localStorage.getItem('userCredentials');
    
    if (credentials) {
      // If credentials exist, add the Basic Auth header to the request
      config.headers.Authorization = `Basic ${credentials}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;