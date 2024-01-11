import React, { useState, useEffect, useRef } from "react";
import { getSessionStorage, setSessionStorage } from "../context/GlobalContext";
import { useCallback } from "react";
import { SERVER_URL, CLIENT_NAV_BUTTON_ICON } from "../data";

const Client = () => {
  console.log("Client rerender :v");

  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [maxStatusPerPage, setMaxStatusPerPage] = useState(5);
  const [alert, setAlert] = useState({ isShow: false, status: "", msg: "" });
  const [isFounded, setIsFounded] = useState(false);
  // const [orderInfo, setOrderInfo] = useState({});
  const [orderStatus, setOrderStatus] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState(
    getSessionStorage("cl-s-bar")
  );
  const searchBar = useRef();

  const fetchOrder = useCallback(async () => {
    if (searchCriteria.length === 0) {
      return;
    }

    const url = SERVER_URL + "/api/orders/" + searchCriteria;
    const options = {
      method: "GET",
      credentials: "include", // ! very important, don't forget
    };

    try {
      const res = await fetch(url, options);
      const json = await res.json();

      if (json["status"] === "fail") {
        setAlert({
          isShow: true,
          status: json["status"],
          msg: json["data"]["msg"],
        });
        throw Error(json["data"]["msg"]);
      }

      const newOrderStatus = json["data"]["order_status"].map(
        (status, index, arr) => {
          if (index === 0 || index === arr.length - 1) return status;

          if (
            status["consol_point_name"] !==
              arr[index + 1]["consol_point_name"] &&
            status["timestamp"] === arr[index + 1]["timestamp"]
          ) {
            return {
              ...status,
              ["consol_point_name_sender"]: status["consol_point_name"],
              ["consol_point_name_receiver"]:
                arr[index + 1]["consol_point_name"],
            };
          }

          if (
            status["consol_point_name"] !==
              arr[index - 1]["consol_point_name"] &&
            status["timestamp"] === arr[index - 1]["timestamp"]
          ) {
            return null;
          }

          return status;
        }
      );

      // console.log(newOrderStatus);

      const finalOrderStatus = newOrderStatus.filter(
        (status) => status !== null
      );

      console.log(finalOrderStatus);

      // setOrderInfo(json["data"]["order_info"]);
      setOrderStatus(finalOrderStatus);

      setIsFounded(true);
      setAlert({
        isShow: true,
        status: "success",
        msg: json["data"]["msg"],
      });

      // console.log(json["data"]); // debug
    } catch (err) {
      console.error(err);
    }
  }, [searchCriteria]);

  useEffect(() => {
    searchBar.current.focus();
  }, []);

  useEffect(() => {
    fetchOrder();
  }, [searchCriteria, fetchOrder]);

  const backPage = (e) => {
    setCurrentPageNum((oldCurrentPageNum) =>
      currentPageNum === 1 ? oldCurrentPageNum : oldCurrentPageNum - 1
    );
  };
  const nextPage = (e) => {
    setCurrentPageNum((oldCurrentPageNum) =>
      orderStatus.length > oldCurrentPageNum * maxStatusPerPage
        ? oldCurrentPageNum + 1
        : oldCurrentPageNum
    );
  };

  const handleSearchBarChange = (e) => {
    setSessionStorage("cl-s-bar", searchBar.current.value);
    setSearchCriteria(searchBar.current.value);
  };

  const handleSenderAndReceiver = (status) => {
    // console.log(status);

    if (
      status["sender_subject"] === "sender" &&
      status["receiver_subject"] === "tp"
    ) {
      console.log("yes1");
      return (
        <>
          <td>{status["customer_name"]}</td>
          <td>{status["trade_point_name"]}</td>
        </>
      );
    }

    if (
      status["sender_subject"] === "tp" &&
      status["receiver_subject"] === "cp"
    ) {
      console.log("yes2");
      return (
        <>
          <td>{status["trade_point_name"]}</td>
          <td>{status["consol_point_name"]}</td>
        </>
      );
    }

    if (
      status["sender_subject"] === "cp" &&
      status["receiver_subject"] === "cp"
    ) {
      console.log("yes3");
      return (
        <>
          <td>{status["consol_point_name_sender"]}</td>
          <td>{status["consol_point_name_receiver"]}</td>
        </>
      );
    }

    if (
      status["sender_subject"] === "cp" &&
      status["receiver_subject"] === "tp"
    ) {
      return (
        <>
          <td>{status["consol_point_name"]}</td>
          <td>{status["trade_point_name"]}</td>
        </>
      );
    }

    if (
      status["sender_subject"] === "tp" &&
      status["receiver_subject"] === "receiver"
    ) {
      console.log("yes4");
      return (
        <>
          <td>{status["trade_point_name"]}</td>
          <td>{status["customer_name"]}</td>
        </>
      );
    }
  };

  // const mockFunc = () => {
  //   return (
  //     <>
  //       <td>abc</td>
  //       <td>bnd</td>
  //     </>
  //   );
  // };

  return (
    <main className="client-main">
      {/* <nav className="client-nav">
        <p>MagicPost</p>
        <p>So fast, it feels like magic</p>
      </nav> */}

      <div className="client-wrapper">
        <section className="client-section">
          <label htmlFor="cl-s-bar">
            <p>
              <em>
                <span className="magic">MagicPost</span>, so fast, it feels like
                real magic. <br />
                Let's check the
                <span className="magic"> progression</span>:
              </em>
            </p>
          </label>
          <input
            type="text"
            name="cl-s-bar"
            id="cl-s-bar"
            ref={searchBar}
            defaultValue={getSessionStorage("cl-s-bar")}
            onChange={handleSearchBarChange}
            placeholder="specify package id (e.g. 1)"
          />
          {alert.isShow && (
            <p className={`alert alert-${alert.status} center`}>{alert.msg}</p>
          )}
        </section>

        {isFounded && (
          <section className="client-section">
            <div className="client-title">
              <h2>Package status</h2>
            </div>

            <div className="section-body collapse show">
              <table className="client-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Type</th>
                    <th>Sender</th>
                    <th>Receiver</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {orderStatus.map((status, index) => {
                    if (
                      index < maxStatusPerPage * (currentPageNum - 1) ||
                      index >= maxStatusPerPage * currentPageNum
                    )
                      return;

                    return (
                      <tr key={index}>
                        <td>{status["timestamp"]}</td>
                        <td>{status["type"]}</td>
                        {handleSenderAndReceiver(status)}
                        <td>{status["status"]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="client-page-nav">
                <button onClick={backPage}>
                  {CLIENT_NAV_BUTTON_ICON["left"]}
                </button>
                <p className="client-page-num">{currentPageNum}</p>
                <button onClick={nextPage}>
                  {CLIENT_NAV_BUTTON_ICON["right"]}
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default Client;
