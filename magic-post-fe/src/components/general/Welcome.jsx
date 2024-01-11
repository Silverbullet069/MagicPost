import React from "react";
import { useGlobalContext } from "../../context/GlobalContext";

function Welcome() {
  const { user } = useGlobalContext();

  // console.log(user);

  return (
    <div className="section-container">
      <section className="section">
        <div className="section-title">
          <h1>
            Welcome to Magic Post's Management System for{" "}
            {user["role"] === "senior_mng"
              ? "Senior Managers"
              : user["role"] === "tp_mng"
              ? "Trade Point Managers"
              : user["role"] === "cp_mng"
              ? "Consolidation Point Managers"
              : user["role"] === "tp_emp"
              ? "Trade Point Employees"
              : user["role"] === "cp_emp"
              ? "Consolidation Point Employees"
              : ""}
          </h1>
        </div>
      </section>

      {/* other section comes here... */}

      <section className="section">
        <div className="section-title">
          <h2>Account Information:</h2>
        </div>

        <div className="section-body show">
          <table className="user-info">
            {/* <thead>
              <tr>
                <th>&nbsp;</th>
                <th>&nbsp;</th>
              </tr>
            </thead> */}
            <tbody>
              <tr>
                <td>User ID:</td>
                <td>{user["id"]}</td>
              </tr>

              <tr>
                <td>Name:</td>
                <td>{user["name"]}</td>
              </tr>

              <tr>
                <td>Username:</td>
                <td>{user["username"]}</td>
              </tr>

              <tr>
                <td>Supervisor ID:</td>
                <td>{user["supervisor_id"] || "Unassigned"}</td>
              </tr>

              <tr>
                <td>Supervisor Name:</td>
                <td>{user["supervisor_name"] || "Unassigned"}</td>
              </tr>

              <tr>
                <td>Point ID:</td>
                <td>{user["point_id"] || "Unassigned"}</td>
              </tr>

              <tr>
                <td>Point Name:</td>
                <td>{user["point_name"] || "Unassigned"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Welcome;
