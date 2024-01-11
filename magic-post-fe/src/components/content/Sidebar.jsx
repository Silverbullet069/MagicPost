import React from "react";

import { Link } from "react-router-dom";
import { useGlobalContext } from "../../context/GlobalContext";

function Sidebar({ props }) {
  const { user } = useGlobalContext();

  const normalize = (str) => {
    return str.replace(/[^A-Za-z0-9]/g, "");
  };

  const toggleChild = (classSelector) => {
    classSelector = "." + classSelector;

    document.querySelector(classSelector)?.classList.toggle("active");
    document.querySelectorAll(classSelector + "-child")?.forEach((element) => {
      element.classList.toggle("hide");
      element.classList.remove("active");
    });

    document
      .querySelectorAll(classSelector + "-grandchild")
      ?.forEach((element) => {
        element.classList.add("hide");
        element.classList.remove("active");
      });
  };

  // for now, tree size is 3
  return (
    <aside className="sidebar">
      <ul>
        {props.map((lv1, index) => (
          <li key={index}>
            {(lv1.url && (
              <Link
                className="sidebar-link lv1"
                to={lv1.url
                  .replace(":id", user["id"])
                  .replace(":pointId", user["point_id"])}
              >
                {lv1.icon}
                {lv1.name}
              </Link>
            )) || (
              <button
                className={`${normalize(lv1.name)} sidebar-btn lv1`}
                onClick={(e) => toggleChild(normalize(lv1.name))}
              >
                {lv1.icon}
                {lv1.name}
              </button>
            )}
            <ul className={`hide ${normalize(lv1.name)}-child`}>
              {lv1.nested &&
                lv1.nested.map((lv2, index) => {
                  return (
                    <li key={index}>
                      {(lv2.url && (
                        <Link
                          className={`hide ${normalize(
                            lv1.name
                          )}-child sidebar-link lv2`}
                          to={lv2.url
                            .replace(":id", user["id"])
                            .replace(":pointId", user["point_id"])}
                        >
                          {lv2.icon}
                          {lv2.name}
                        </Link>
                      )) || (
                        <button
                          className={`hide ${normalize(
                            lv1.name
                          )}-child ${normalize(lv2.name)} sidebar-btn lv2`}
                          onClick={(e) => toggleChild(normalize(lv2.name))}
                        >
                          {lv2.icon}
                          {lv2.name}
                        </button>
                      )}
                      <ul
                        className={`hide ${normalize(
                          lv2.name
                        )}-child ${normalize(lv1.name)}-grandchild`}
                      >
                        {lv2.nested &&
                          lv2.nested.map((lv3, index) => {
                            return (
                              <li key={index}>
                                {(lv3.url && (
                                  <Link
                                    className={`hide ${normalize(
                                      lv1.name
                                    )}-grandchild ${normalize(
                                      lv2.name
                                    )}-child sidebar-link lv3`}
                                    to={lv3.url
                                      .replace(":id", user["id"])
                                      .replace(":pointId", user["point_id"])}
                                  >
                                    {lv3.icon}
                                    {lv3.name}
                                  </Link>
                                )) || (
                                  <button
                                    className={`hide ${normalize(
                                      lv1.name
                                    )}-grandchild ${normalize(
                                      lv2.name
                                    )}-child sidebar-btn lv3`}
                                  >
                                    {lv3.icon}
                                    {lv3.name}
                                  </button>
                                )}
                              </li>
                            );
                          })}
                      </ul>
                    </li>
                  );
                })}
            </ul>
          </li>
        ))}
      </ul>

      {/* debug
      <Link to="points/trades">list point trades</Link>
      <Link to="points/trades/create">create point trades</Link>
      <Link to="points/trades/edit">edit point trades</Link>
      <Link to="points/trades/delete">delete point trades</Link> */}
    </aside>
  );
}

export default Sidebar;
