import { useState } from "react";
import "../css/delete-account.css";

/**
 * DeleteAccountCard
 * -----------------
 * "Danger zone" card for the Settings page + a simple confirmation dialog.
 * Dialog: "Are you sure you want to delete your account?" with No / Yes.
 * No email or password is asked - the request is already authenticated by
 * the logged-in JWT. On success onDeleted() clears the session and sends
 * the person to the login page.
 *
 * Props:
 *   deleteAccount()  -> API call (axios promise)
 *   onDeleted()      -> log out + go to login
 */
function DeleteAccountCard({ deleteAccount, onDeleted }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    if (busy) return;
    setOpen(false);
    setError("");
  };

  const confirmDelete = async () => {
    if (busy) return;
    setError("");
    setBusy(true);

    try {
      await deleteAccount();
      // Let the "Deleting your account..." message be seen for a moment.
      await new Promise((resolve) => setTimeout(resolve, 1200));
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
          This permanently deletes your account and all of its data. You won't
          be able to log in again. This cannot be undone.
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
          <div
            className="delete-account-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            onClick={(e) => e.stopPropagation()}
          >
            {busy ? (
              <div className="delete-account-dialog__busy">
                <span className="delete-account-spinner" aria-hidden="true" />
                <h3 id="delete-account-title">Deleting your account...</h3>
                <p>
                  This will only take a moment. Please don't close this page.
                </p>
              </div>
            ) : (
              <>
                <h3 id="delete-account-title">
                  Are you sure you want to delete your account?
                </h3>
                <p>This cannot be undone.</p>

                {error && (
                  <p className="delete-account-dialog__error">{error}</p>
                )}

                <div className="delete-account-dialog__actions">
                  <button
                    type="button"
                    className="delete-account-dialog__cancel"
                    onClick={close}
                    autoFocus
                  >
                    No
                  </button>
                  <button
                    type="button"
                    className="delete-account-dialog__yes"
                    onClick={confirmDelete}
                  >
                    Yes, delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default DeleteAccountCard;
