import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import Select from "react-select";
import {
  SERVER_URL,
  arrayRange,
  checkError,
  makeOptionsFromString,
} from "../../data";
import { useGlobalContext } from "../../context/GlobalContext";

const StatisticsSeniorMng = ({
  all_trades_api,
  one_trade_api,
  all_consols_api,
  one_consol_api,
}) => {
  console.log("StatisticsSeniorMng rerender");
  const [alert, setAlert] = useState({ show: false, status: "", msg: "" });

  // Static template
  const typeOptions = useMemo(
    () => makeOptionsFromString(["trading", "consolidation"]),
    []
  );
  const directionOptions = useMemo(
    () => makeOptionsFromString(["sent", "received"]),
    []
  );
  // const yearOptions = useMemo(
  //   () => makeOptionsFromString(arrayRange(2022, new Date().getFullYear(), 1)),
  //   []
  // ); // Assume MagicPost founded in 2022
  // const monthOptions = useMemo(
  //   () => makeOptionsFromString(arrayRange(1, 12, 1)),
  //   []
  // );

  // Dynamic template
  const [allTimeStats, setAllTimeStats] = useState({
    all_tp_sent: "",
    all_tp_received: "",
    all_cp_sent: "",
    all_cp_received: "",
  });
  const [filterCriterias, setFilterCriterias] = useState({
    type: "",
    dir: "",
    id: "",
    name: "",
  });
  const [tradePointOptions, setTradePointOptions] = useState([]);
  const [consolPointOptions, setConsolPointOptions] = useState([]);
  const pointSelectElement = useRef();

  const fetchInitialData = useCallback(() => {
    const url_trades = SERVER_URL + all_trades_api;
    const url_consols = SERVER_URL + all_consols_api;

    const options = {
      method: "GET",
      credentials: "include", // ! very important, don't forget
    };

    try {
      Promise.all([
        fetch(url_trades, options).then((res) => res.json()),
        fetch(url_consols, options).then((res) => res.json()),
      ]).then((res) => {
        const res_trades = res[0];
        const res_consols = res[1];

        if (
          res_trades["status"] === "fail" ||
          res_consols["status"] === "fail"
        ) {
          throw Error(
            `Trades API error: ${res_trades["data"]["msg"]}. Consolidation API error: ${res_consols["data"]["msg"]}`
          );
        }

        setTradePointOptions(
          res_trades["data"]["stats"]["sent"].map((point) => {
            return {
              value: point["id"],
              label: point["name"],
            };
          })
        );

        setConsolPointOptions(
          res_consols["data"]["stats"]["sent"].map((point) => {
            return {
              value: point["id"],
              label: point["name"],
            };
          })
        );

        setAllTimeStats({
          all_tp_sent: res_trades["data"]["stats"]["sent"].reduce(
            (prev, current) => prev + current["total"],
            0
          ),

          all_tp_received: res_trades["data"]["stats"]["received"].reduce(
            (prev, current) => prev + current["total"],
            0
          ),

          all_cp_sent: res_consols["data"]["stats"]["sent"].reduce(
            (prev, current) => prev + current["total"],
            0
          ),

          all_cp_received: res_consols["data"]["stats"]["received"].reduce(
            (prev, current) => prev + current["total"],
            0
          ),
        });
      });
    } catch (err) {
      console.error(err);
    }
  }, []);

  const [filterStats, setFilterStats] = useState([]); // {name: '', interval: '', total: ''}

  const fetchFilterData = useCallback(async () => {
    if (!filterCriterias.id || !filterCriterias.type || !filterCriterias.dir) {
      return;
    }

    const url =
      SERVER_URL +
      `${
        filterCriterias.type === "trading"
          ? one_trade_api.replace("<int:id>", filterCriterias.id)
          : one_consol_api.replace("<int:id>", filterCriterias.id)
      }` +
      Object.keys(filterCriterias)
        .filter((criteria) => criteria !== "name") // NOTE: DO NOT INCLUDE NAME INSIDE url, it contains non alphabet chars
        .reduce((prev, current, idx) => {
          return (
            prev +
            `${idx === 0 ? "?" : "&"}` +
            `${current}=${filterCriterias[current]}`
          );
        }, "");

    const options = {
      method: "GET",
      credentials: "include", // ! very important, don't forget
    };

    fetch(url, options)
      .then((res) => res.json())
      .then((json) => {
        if (json["status"] === "fail") {
          setAlert({
            show: true,
            status: json["status"],
            msg: json["data"]["msg"],
          });
          throw Error(json["data"]["msg"]);
        }

        console.log(json);

        setFilterStats(
          json["data"]["stats"][
            `${filterCriterias.dir === "sent" ? "sent" : "received"}`
          ]
        );

        setAlert({
          show: true,
          status: json["status"],
          msg: json["data"]["msg"],
        });
      });

    console.log("fetch filter data", url);

    // const url = SERVER_URL + filterCriteria.current.type === 'trading' ? one_trade_api.replace('<int:id>', )
  }, [filterCriterias]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    fetchFilterData();
  }, [filterCriterias, fetchFilterData]);

  const handleSelectChange = (e, property) => {
    if (!e) setFilterStats([]);

    setFilterCriterias((oldFilterCriterias) => {
      return { ...oldFilterCriterias, [property]: e ? e.label : "" };
    }); // property, e.label
    console.log(filterCriterias);
  };

  const handleNameChange = (e) => {
    if (!e) setFilterStats([]);

    setFilterCriterias((oldFilterCriterias) => {
      return {
        ...oldFilterCriterias,
        ["id"]: e ? e.value : "",
        ["name"]: e ? e.label : "",
      };
    }); // id, e.value
    console.log(filterCriterias);
  };

  return (
    <div className="section-container">
      <section className="section">
        <div className="section-title">
          <h1>All Time</h1>
        </div>

        <div className="section-body collapse show">
          <div className="stats-card-wrapper">
            <article className="stats-card">
              <h2 className="stats-card-title">Trading Point</h2>
              <div className="stats-card-body">
                <p>#Sent</p>
                <p className="stats-card-value">{allTimeStats.all_tp_sent}</p>
              </div>
            </article>

            <article className="stats-card">
              <h2 className="stats-card-title">Trading Point</h2>
              <div className="stats-card-body">
                <p>#Received</p>
                <p className="stats-card-value">
                  {allTimeStats.all_tp_received}
                </p>
              </div>
            </article>

            <article className="stats-card">
              <h2 className="stats-card-title">Consolidation Point</h2>

              <div className="stats-card-body">
                <p>#Sent</p>
                <p className="stats-card-value">{allTimeStats.all_cp_sent}</p>
              </div>
            </article>

            <article className="stats-card">
              <h2 className="stats-card-title">Consolidation Point</h2>

              <div className="stats-card-body">
                <p>#Received</p>
                <p className="stats-card-value">
                  {allTimeStats.all_cp_received}
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-title">
          <h1>Per Point, Per Time Interval</h1>
        </div>

        <div className="section-body collapse show">
          <div className="stats-select-group-point">
            <div>
              <label htmlFor="ft">
                Type:
                <p className="required">*</p>
              </label>
              <Select
                inputId="ft"
                name="type"
                placeholder="choose type..."
                options={typeOptions}
                onChange={(e) => {
                  pointSelectElement.current.clearValue();
                  handleSelectChange(e, "type");
                }}
                isRequired
                isSearchable
                isClearable
              />
            </div>

            <div>
              <label htmlFor="fn">
                Name:
                <p className="required">*</p>
              </label>
              <Select
                inputId="fn"
                name="name"
                placeholder="choose name..."
                options={
                  filterCriterias.type === "trading"
                    ? tradePointOptions
                    : filterCriterias.type === "consolidation"
                    ? consolPointOptions
                    : [] // always remember
                }
                onChange={handleNameChange}
                ref={pointSelectElement}
                isRequired
                isSearchable
                isClearable
              />
            </div>

            <div>
              <label htmlFor="fd">
                Direction:
                <p className="required">*</p>
              </label>
              <Select
                inputId="fd"
                name="dir"
                placeholder="choose direction..."
                options={directionOptions}
                onChange={(e) => handleSelectChange(e, "dir")}
                isRequired
                isSearchable
                isClearable
              />
            </div>
          </div>
          {alert.show && (
            <p className={`alert alert-${alert.status}`}>{alert.msg}</p>
          )}
        </div>
      </section>

      <section className="section">
        {/* <div className="section-title">
          {filterStats.length > 0 && <h2>{filterStats[0].name} Statistics</h2>}
        </div> */}
        <div className="section-body">
          <table className="stats-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Interval</th>
                <th>Type</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {filterStats.length > 0 &&
                filterStats.map((stat, idx) => {
                  return (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{stat["name"] || filterCriterias.name}</td>
                      <td>{stat["time_interval"] || "All Time"}</td>
                      <td>{filterCriterias.dir}</td>
                      <td>{stat["total"] || "0"}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default StatisticsSeniorMng;
