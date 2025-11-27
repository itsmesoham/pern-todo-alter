import React, { useState } from "react";

export default function SendEmailModal({ selectedTodo, closeModal }) {
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // success / error message
  const [statusType, setStatusType] = useState(""); // "success" or "error"

  /* EMAIL VALIDATION */
  const isValidEmail = (email) => {
    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  };

  const sendEmail = async () => {
    // EMPTY CHECK
    if (!emailInput.trim()) {
      setStatus("Please enter an email address.");
      setStatusType("error");
      return;
    }

    // FORMAT VALIDATION
    if (!isValidEmail(emailInput)) {
      setStatus("Invalid email format. Please enter a valid email address.");
      setStatusType("error");
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("http://localhost:5000/todo-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          mode: "email",
          to: emailInput,
          subject: "Your Todo PDF",
          message: `Thank you for using the PERN Todo App!
          
          Attached is the PDF copy of your selected todo with todo_id: ${selectedTodo.todo_id}`,
          todo_id: selectedTodo.todo_id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("Email sent successfully!");
        setStatusType("success");

        setTimeout(() => {
          closeModal();
        }, 1800);
      } else {
        setStatus(data.error || "Failed to send email.");
        setStatusType("error");
      }
    } catch (err) {
      console.error("Email Error:", err);
      setStatus("Failed to send email.");
      setStatusType("error");
    }

    setLoading(false);
  };

  return (
    <>
      <style>
        {`
          /* Background fade */
          .modal-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.55);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            animation: fadeIn 0.2s ease-in-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }

          /* Modal box */
          .modal-box {
            background: #ffffff;
            padding: 25px;
            border-radius: 14px;
            width: 360px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.25);
            text-align: center;
            animation: popUp 0.25s ease-out;
          }

          @keyframes popUp {
            0%   { transform: scale(0.85); opacity: 0; }
            100% { transform: scale(1);   opacity: 1; }
          }

          h3 {
            font-weight: 600;
            margin-bottom: 12px;
          }

          .modal-box input {
            width: 100%;
            padding: 12px;
            margin: 15px 0;
            border: 1px solid #ccc;
            border-radius: 8px;
            font-size: 16px;
            transition: 0.2s;
          }

          /* Highlight input if invalid */
          .modal-box input.invalid {
            border-color: #dc3545;
            background: #fff5f5;
          }

          .modal-box input:focus {
            border-color: #007bff;
            box-shadow: 0 0 5px rgba(0,123,255,0.4);
          }

          /* Buttons */
          .primary-btn {
            background: #007bff;
            color: white;
            padding: 10px 18px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            margin-right: 8px;
            transition: 0.3s;
          }

          .primary-btn:hover {
            background: #0068d6;
          }

          .cancel-btn {
            background: #e0e0e0;
            padding: 10px 18px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            transition: 0.3s;
          }

          .cancel-btn:hover {
            background: #ccc;
          }

          .disabled-btn {
            opacity: 0.6;
            cursor: not-allowed;
          }

          /* Status box */
          .status-box {
            padding: 10px;
            margin-top: 12px;
            border-radius: 6px;
            font-weight: 500;
            animation: fadeIn 0.2s ease-in-out;
          }

          .success {
            background: #d4edda;
            color: #155724;
            border-left: 4px solid #28a745;
          }

          .error {
            background: #f8d7da;
            color: #721c24;
            border-left: 4px solid #dc3545;
          }

          /* Loading spinner */
          .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #007bff;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            animation: spin 0.8s linear infinite;
            display: inline-block;
            margin-right: 6px;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      <div className="modal-container">
        <div className="modal-box">
          <h3>Send PDF to Email</h3>

          <input
            type="email"
            placeholder="Enter recipient email"
            value={emailInput}
            className={!isValidEmail(emailInput) && emailInput ? "invalid" : ""}
            onChange={(e) => {
              setEmailInput(e.target.value);

              if (!isValidEmail(e.target.value)) {
                setStatus("Invalid email format.");
                setStatusType("error");
              } else {
                setStatus(null);
              }
            }}
            onKeyDown={(e) => e.key === "Enter" && sendEmail()}
          />

          {/* Status Message */}
          {status && <div className={`status-box ${statusType}`}>{status}</div>}

          {/* Buttons */}
          <div style={{ marginTop: "15px" }}>
            <button
              onClick={sendEmail}
              disabled={loading}
              className={`primary-btn ${loading ? "disabled-btn" : ""}`}
            >
              {loading ? <span className="spinner"></span> : "Send"}
              {loading ? "Sending..." : ""}
            </button>

            <button onClick={closeModal} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}