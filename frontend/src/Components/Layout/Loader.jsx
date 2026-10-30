const Loader = ({ label = "Loading...", fullPage = false }) => (
  <div
    className={`loader${fullPage ? " loader-full-page" : ""}`}
    role="status"
    aria-label={label}
  >
    <span className="spinner" aria-hidden="true" />
    <span>{label}</span>
  </div>
);
export default Loader;
