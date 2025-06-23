import React from "react";
import MCQChallenge from "./MCQChallenge";
import { useApi } from "../utils/api";

const ChallengeGenerator = () => {
  const [challenge, setChallenge] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [difficulty, setDifficulty] = React.useState("easy");
  const [quota, setQuota] = React.useState(null);
  const { makeRequest } = useApi();

  React.useEffect(() => {
    fetchQuota();
  }, []);

  const fetchQuota = async () => {
    try {
      const response = await makeRequest("quota");
      setQuota(response);
    } catch (error) {
      console.error("Error fetching quota:", error);
    }
  };

  const generateChallenge = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await makeRequest("create", {
        method: "POST",
        body: JSON.stringify({ difficulty }),
      });
      setChallenge(response);
      fetchQuota(); // Refresh quota after generating a challenge
    } catch (error) {
      setError(
        error.message || "An error occurred while generating the challenge."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getNextResetTime = () => {
    if (!quota?.last_reset_date) return null;
    const resetDate = new Date(quota.last_reset_date);
    resetDate.setHours(resetDate.getHours() + 24);

    return resetDate;
  };

  return (
    <div className="challenge-container">
      <h2>Challenge Generator</h2>
      <div className="quota-display">
        <p>Challenges Remaining: {quota?.quota_remaining || 0}</p>
        {quota?.quota_remaining === 0 && (
          <p>Next reset: {getNextResetTime()?.toLocaleString()}</p>
        )}
      </div>
      <div className="difficulty-selector">
        <label htmlFor="difficulty">Select Difficulty</label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          disabled={isLoading}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <button
        onClick={generateChallenge}
        // disabled={isLoading || quota?.quota_remaining === 0}
        className="generate-button"
      >
        {isLoading ? "Generating..." : "Generate Challenge"}
      </button>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {challenge && <MCQChallenge challenge={challenge} />}
    </div>
  );
};

export default ChallengeGenerator;
