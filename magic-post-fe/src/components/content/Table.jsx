import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";

import { CLIENT_URL, SERVER_URL } from "../../data";

// import { useGlobalContext } from "../../context/GlobalContext";

import {
  normalize,
  randomColor,
  SECTION_NAV_BUTTON_ICON,
  ACTION_BUTTONS,
} from "../../data";
import { useListContext } from "../../context/ListContext";

function Table({
  user,
  name,
  api,
  displayList,
  setDisplayList,
  propertyOrder,
  edit,

  setCurrentPageNum,
  currentPageNum,
}) {
  console.log("%c Table rerender :v", randomColor());

  const [maxItemPerPage, setMaxItemPerPage] = useState(5);

  const [alert, setAlert] = useState({ show: false, status: "", msg: "" });

  const handleMaxItemPerPageChange = (e) => {
    setMaxItemPerPage(e.value);
  };

  const handleDeleteItem = (id) => {
    // TODO: this is just front-end viewing, it doesn't reflect database by actually fetch it again, might need improve

    if (confirm(`Do you want to delete item ${id}?`)) {
      const url =
        SERVER_URL +
        `${
          api.includes("<int:mng_id>")
            ? api.replace("<int:mng_id>", user["id"])
            : api
        }` +
        `/${id}`;

      const options = {
        method: "DELETE",
        credentials: "include", // ! very important, don't forget
      };

      fetch(url, options)
        .then((res) => res.json())
        .then((json) => {
          if (json["status"] === "fail") {
            throw Error(json["data"]["msg"]);
          }

          console.log(json["data"]);

          setDisplayList((oldDisplayList) => {
            return oldDisplayList.filter((item) => item.id !== id);
          });

          setAlert({
            show: true,
            status: "success",
            msg: json["data"]["msg"],
          });
        })
        .catch((err) => console.error(err));
    }
  };

  const backPage = (e) => {
    setCurrentPageNum((oldCurrentPageNum) =>
      currentPageNum === 1 ? oldCurrentPageNum : oldCurrentPageNum - 1
    );
  };
  const nextPage = (e) => {
    setCurrentPageNum((oldCurrentPageNum) =>
      displayList.length > oldCurrentPageNum * maxItemPerPage
        ? oldCurrentPageNum + 1
        : oldCurrentPageNum
    );
  };

  return (
    <section className="section">
      <div className="section-title">
        <h1>List {name}</h1>

        {edit && (
          <nav className="dashboard-page-nav">
            <p>
              {displayList.length === 0
                ? 0
                : (currentPageNum - 1) * maxItemPerPage + 1}{" "}
              - {Math.min(currentPageNum * maxItemPerPage, displayList.length)}{" "}
              of {displayList.length} displays
            </p>

            <Select
              options={Array.from(Array(5).keys()).map((num) => {
                return { label: num + 1, value: num + 1 };
              })}
              isSearchable
              defaultValue={maxItemPerPage}
              onChange={handleMaxItemPerPageChange}
            />

            <button onClick={backPage}>
              {SECTION_NAV_BUTTON_ICON["left"]}
            </button>
            <p className="dashboard-page-num">{currentPageNum}</p>
            <button onClick={nextPage}>
              {SECTION_NAV_BUTTON_ICON["right"]}
            </button>
          </nav>
        )}
      </div>

      <div className="section-body collapse show">
        <table cellPadding={0} cellSpacing={0} className="table-list">
          <thead>
            <tr>
              {propertyOrder.map((property, idx) => (
                <th key={idx} className={`table-${property}`}>
                  <p>{normalize(property)}</p>
                </th>
              ))}

              {/* Display action only it has editPath */}
              {edit && (
                <th>
                  <p>Action</p>
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {displayList.length > 0 &&
              displayList.map((item, index) => {
                if (
                  index < maxItemPerPage * (currentPageNum - 1) ||
                  index >= maxItemPerPage * currentPageNum
                )
                  return;

                return (
                  <tr key={index}>
                    {propertyOrder.map((property, idx) => (
                      <td key={idx}>{item[property]}</td>
                    ))}

                    {edit && (
                      <td className="nowrap">
                        <Link
                          to={edit ? CLIENT_URL + "/dashboard/" + edit : "#"}
                          state={{ editId: item[propertyOrder[0]], item }}
                        >
                          {ACTION_BUTTONS.edit}
                        </Link>
                        <button onClick={(e) => handleDeleteItem(item["id"])}>
                          {ACTION_BUTTONS.delete}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
          </tbody>
        </table>

        {alert.show && (
          <p className={`alert alert-${alert.status}`}>{alert.msg}</p>
        )}
      </div>
    </section>
  );
}

export default Table;
