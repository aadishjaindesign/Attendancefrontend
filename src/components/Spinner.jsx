import "./Spinner.css";

function Spinner({ size = 24, color = "#4f46e5" }) {
  return (
    <span className="spinner-wrap">
      <svg
        className="spinner-svg"
        width={size}
        height={size}
        viewBox="0 0 50 50"
        style={{ "--spinner-color": color }}
      >
        <circle
          className="spinner-path"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="4"
        />
      </svg>
    </span>
  );
}

export default Spinner;