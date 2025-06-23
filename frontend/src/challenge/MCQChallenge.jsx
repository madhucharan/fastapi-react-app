import React from "react";

const MCQChallenge = ({ challenge, showExplanation = false }) => {
  const [selectedOption, setSelectedOption] = React.useState(null);
  const [shouldShowExplanation, setShouldShowExplanation] =
    React.useState(showExplanation);

  const options =
    typeof challenge.options === "string"
      ? JSON.parse(challenge.options)
      : challenge.options;

  React.useEffect(() => {
    setSelectedOption(null);
    setShouldShowExplanation(showExplanation);
  }, [challenge, showExplanation]);

  const handleOptionSelect = (index) => {
    if (selectedOption !== null) return; // Prevent re-selection
    setSelectedOption(index);
    setShouldShowExplanation(true);
  };

  const getOptionClass = (index) => {
    if (selectedOption === null) return "option";

    if (index === challenge.correct_answer_id) {
      return "option correct";
    }

    if (selectedOption === index && index !== challenge.correct_answer_id) {
      return "option incorrect";
    }

    return "option";
  };

  return (
    <div className="challenge-display">
      <p>
        <strong>Difficulty</strong>: {challenge.difficulty}
      </p>

      <p className="challenge-title">{challenge.title}</p>

      <div className="options">
        {options.map((option, index) => (
          <div
            key={index}
            className={getOptionClass(index)}
            onClick={() => handleOptionSelect(index)}
          >
            {option}
          </div>
        ))}
      </div>

      {shouldShowExplanation && selectedOption !== null && (
        <div className="explanation">
          <h4>Explanation</h4>
          <p>{challenge.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default MCQChallenge;
