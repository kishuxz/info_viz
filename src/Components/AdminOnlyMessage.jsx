// src/AdminOnlyMessage.js
import React from "react";
import { Link } from "react-router-dom";

function AdminOnlyMessage() {
  return (
    <div className="container my-5">
      <div className="text-center">
        <h4>Admin access only</h4>
        <p className="text-muted">
          Please <Link to="/login">log in</Link> or{" "}
          <Link to="/register">register</Link> to manage forms.
        </p>
      </div>
    </div>
  );
}

export default AdminOnlyMessage;
