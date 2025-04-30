import React, { useState, useEffect } from "react";
import axios from "axios";

const ApiDiagnostic = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const runTest = async () => {
    setLoading(true);
    setResults([]);

    // Log environment variables
    addResult("Environment", {
      VITE_API_URL: import.meta.env.VITE_API_URL || "Not set",
      NODE_ENV: import.meta.env.MODE || "Not available",
    });

    // Test direct fetch to server root
    try {
      const response = await fetch(`${apiBaseUrl}/`);
      const status = response.status;
      const text = await response.text();
      addResult("Direct fetch to server root", {
        url: `${apiBaseUrl}/`,
        status,
        response: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
      });
    } catch (error: any) {
      addResult("Direct fetch to server root", {
        url: `${apiBaseUrl}/`,
        error: error.message,
      });
    }

    // Test direct fetch to API health endpoint
    try {
      const response = await fetch(`${apiBaseUrl}/api/health`);
      const status = response.status;
      let data;
      try {
        data = await response.json();
      } catch {
        const text = await response.text();
        data = text.substring(0, 100) + (text.length > 100 ? "..." : "");
      }
      addResult("Direct fetch to health endpoint", {
        url: `${apiBaseUrl}/api/health`,
        status,
        response: data,
      });
    } catch (error: any) {
      addResult("Direct fetch to health endpoint", {
        url: `${apiBaseUrl}/api/health`,
        error: error.message,
      });
    }

    // Test axios with baseURL
    try {
      const axiosInstance = axios.create({
        baseURL: apiBaseUrl,
      });
      const response = await axiosInstance.get("/api/problems");
      addResult("Axios with correct baseURL", {
        url: `${apiBaseUrl}/api/problems`,
        status: response.status,
        data: response.data,
      });
    } catch (error: any) {
      addResult("Axios with correct baseURL", {
        url: `${apiBaseUrl}/api/problems`,
        error: error.message,
        response: error.response?.data || "No response data",
      });
    }

    // Test direct endpoint with no /api prefix
    try {
      const response = await fetch(`${apiBaseUrl}/problems`);
      const status = response.status;
      let data;
      try {
        data = await response.json();
      } catch {
        const text = await response.text();
        data = text.substring(0, 100) + (text.length > 100 ? "..." : "");
      }
      addResult("Direct fetch without /api prefix", {
        url: `${apiBaseUrl}/problems`,
        status,
        response: data,
      });
    } catch (error: any) {
      addResult("Direct fetch without /api prefix", {
        url: `${apiBaseUrl}/problems`,
        error: error.message,
      });
    }

    setLoading(false);
  };

  const addResult = (title: string, data: any) => {
    setResults((prev) => [
      ...prev,
      { title, data, timestamp: new Date().toISOString() },
    ]);
  };

  return (
    <div className="p-4 bg-dark text-light">
      <h2 className="mb-4">API Diagnostic Tool</h2>

      <div className="mb-4">
        <p className="mb-2">
          This tool will help diagnose API connection issues.
        </p>
        <button
          className="btn btn-primary me-2"
          onClick={runTest}
          disabled={loading}
        >
          {loading ? "Running Tests..." : "Run Diagnostic Tests"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-3">Test Results</h3>
          {results.map((result, index) => (
            <div key={index} className="card bg-dark border-secondary mb-3">
              <div className="card-header d-flex justify-content-between">
                <span>{result.title}</span>
                <small className="text-muted">{result.timestamp}</small>
              </div>
              <div className="card-body">
                <pre className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApiDiagnostic;
