import React from "react";
import MCQChallenge from "../challenge/MCQChallenge";
import { useApi } from "../utils/api";

const HistoryPanel = () => {
  const [history, setHistory] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const { makeRequest } = useApi();

  React.useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(false);
    setError(null);

    try {
      const response = await makeRequest("history");
      setHistory(response.challenges);
    } catch (error) {
      setError(
        "Failed to fetch history. " + (error.message || "An error occurred.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        Error: {error} <button onClick={fetchHistory}>Retry</button>
      </div>
    );
  }

  return (
    <div className="history-panel">
      <h2>History</h2>
      {history.length === 0 ? (
        <p>No history available </p>
      ) : (
        <div className="history-list">
          {history.map((challenge) => (
            <MCQChallenge
              challenge={challenge}
              showExplanation={true}
              key={challenge.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;
