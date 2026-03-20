import { useState } from "react";
import useAppStore from "../store/store";
import { executeTransaction } from "../utils/executeTransaction";
import "../styles/components/TransactionExecutionPanel.css";

const DEFAULT_LOGIC = `function execute(context) {
  const rate = context.request.penaltyRate;
  const days = context.request.daysLate;
  const penalty = rate * days;
  return {
    penalty: penalty,
    status: days > 0 ? "overdue" : "on-time"
  };
}`;

const DEFAULT_REQUEST = JSON.stringify({ penaltyRate: 5, daysLate: 3 }, null, 2);

const TransactionExecutionPanel = () => {
  const backgroundColor = useAppStore((state) => state.backgroundColor);
  const isDark = backgroundColor === "#121212";

  const [logicCode, setLogicCode] = useState(DEFAULT_LOGIC);
  const [requestJson, setRequestJson] = useState(DEFAULT_REQUEST);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    setError("");
    setResult("");
    try {
      const request: unknown = JSON.parse(requestJson);
      const output = await executeTransaction(logicCode, request);
      setResult(JSON.stringify(output, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsRunning(false);
    }
  };

  const themeClass = isDark ? "dark" : "light";

  return (
    <div className="transaction-panel">
      <div className={`transaction-panel-header transaction-panel-header-${themeClass}`}>
        <span>Transaction Execution</span>
      </div>
      <div className="transaction-panel-body" style={{ backgroundColor }}>
        {/* Logic Code */}
        <div>
          <div className="transaction-panel-label" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
            Logic (logic.ts)
          </div>
          <textarea
            className={`transaction-panel-textarea transaction-panel-textarea-${themeClass}`}
            rows={6}
            value={logicCode}
            onChange={(e) => setLogicCode(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Request JSON */}
        <div>
          <div className="transaction-panel-label" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
            Request JSON
          </div>
          <textarea
            className={`transaction-panel-textarea transaction-panel-textarea-${themeClass}`}
            rows={4}
            value={requestJson}
            onChange={(e) => setRequestJson(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Run Button */}
        <button
          className="transaction-panel-run-button"
          onClick={() => void handleRun()}
          disabled={isRunning}
        >
          {isRunning ? "Running..." : "Run Transaction"}
        </button>

        {/* Result */}
        <div>
          <div className="transaction-panel-label" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
            Result
          </div>
          <div className={`transaction-panel-result transaction-panel-result-${themeClass}`}>
            {error ? (
              <span className="transaction-panel-error">Error: {error}</span>
            ) : result ? (
              result
            ) : (
              <span style={{ opacity: 0.4 }}>Run a transaction to see results...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionExecutionPanel;
