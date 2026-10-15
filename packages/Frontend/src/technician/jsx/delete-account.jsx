import { useState } from "react";
import "../css/delete-account.css";

/**
 * DeleteAccountCard
 * -----------------
 * "Danger zone" card for the Settings page + a confirmation dialog.
 * The person must type their email AND password. If either is wrong the
 * server refuses and the account is NOT deleted. On success the dialog
 * shows a short "Deleting..." state, then onDeleted() clears the session
 * and sends them to the login page.
 *
 * Props:
 *   deleteAccount({ email, password })  -> API call (axios promise)
 *   onDeleted()                         -> log out + go to login
 */
function DeleteAccountCard({ deleteAccount, onDeleted }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    if (busy) return;
    setOpen(false);
    setEmail("");
    setPassword("");
    setError("");
  };

  const confirmDelete = async (event) => {
    event.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);

    try {
      await deleteAccount({ email: email.trim(), password });
      // Let the "Deleting your account..." message be seen for a moment.
      await new Promise((resolve) => setTimeout(resolve, 2000));
      onDeleted();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not delete your account. Please try again.",
      );
      setBusy(false);
    }
  };

  return (
    <>
      <section className="delete-account-card">
        <h2>Delete your account</h2>
        <p>
          This permanently closes your account and you won't be able to log in
          again. This cannot be undone.
        </p>
        <button
          type="button"
          className="delete-account-card__btn"
          onClick={() => setOpen(true)}
        >
          Delete your account
        </button>
      </section>

      {open && (
        <div className="delete-account-overlay" onClick={close}>
          <form
            className="delete-account-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            onClick={(e) => e.stopPropagation()}
            onSubmit={confirmDelete}
          >
            {busy ? (
              <div className="delete-account-dialog__busy">
                <span className="delete-account-spinner" aria-hidden="true" />
                <h3 id="delete-account-title">Deleting your account...</h3>
                <p>This will only take a moment. Please don't close this page.</p>
              </div>
            ) : (
              <>
                <h3 id="delete-account-title">
                  Are you sure you want to delete your account?
                </h3>
                <p>
                  To confirm, enter your email and password. This cannot be
                  undone.
                </p>

                <label>
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="off"
                    autoFocus
                    required
                  />
                </label>

                <label>
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </label>

                {error && <p className="delete-account-dialog__error">{error}</p>}

                <div className="delete-account-dialog__actions">
                  <button
                    type="button"
                    className="delete-account-dialog__cancel"
                    onClick={close}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="delete-account-dialog__yes"
                    disabled={!email.trim() || !password}
                  >
                    Yes, delete my account
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </>
  );
}

export default DeleteAccountCard;
