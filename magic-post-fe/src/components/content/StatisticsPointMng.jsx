import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import Select from "react-select";
import { SERVER_URL } from "../../data";
import { useGlobalContext } from "../../context/GlobalContext";

const StatisticsPointMng = ({ stats_api }) => {
  const { user } = useGlobalContext();

  const [allTimeStats, setAllTimeStats] = useState({
    sent: [],
    received: [],
    totalSent: "",
    totalReceived: "",
  });

  const [filterStats, setFilterStats] = useState([]);

  const directionOptions = useMemo(
    () => [
      {
        value: "sent",
        label: "sent",
      },
      {
        value: "received",
        label: "received",
      },
    ],
    []
  );

  const [filterCriterias, setFilterCriterias] = useState({
    dir: "",
  });

  const fetchInitialData = useCallback(async () => {
    const url = SERVER_URL + stats_api.replace("<int:id>", user["point_id"]);
    const options = {
      method: "GET",
      credentials: "include", // ! very important, don't forget
    };

    fetch(url, options)
      .then((res) => res.json())
      .then((json) => {
        console.log(json);

        if (json["status"] === "fail") {
          throw Error(json["data"]["msg"]);
        }

        setAllTimeStats({
          sent: json["data"]["stats"]["sent"],
          received: json["data"]["stats"]["received"],
          totalSent: json["data"]["stats"]["sent"].reduce((prev, current) => {
            return prev + current["total"];
          }, 0),
          totalReceived: json["data"]["stats"]["received"].reduce(
            (prev, current) => {
              return prev + current["total"];
            },
            0
          ),
        });

        // Sent is default
        setFilterStats(json["data"]["stats"]["sent"]);
        setFilterCriterias((oldFilterCriterias) => {
          return { ...oldFilterCriterias, ["dir"]: "sent" };
        });
      });
  }, []);

  // TODO: Prepare for more filterCriterias
  // const fetchFilterData = useCallback(() => {
  // }, [filterCriterias]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // TODO: Prepare for more filterCriterias
  // useEffect(() => {
  //   fetchFilterData();
  // }, [filterCriteria, fetchFilterData]);

  const handleDirChange = (e) => {
    if (!e) {
      setFilterStats([]);
    }

    setFilterStats(allTimeStats[e.label]);

    //Prepare for more filterCriterias
    setFilterCriterias((oldFilterCriterias) => {
      return { ...oldFilterCriterias, ["dir"]: e.label };
    });
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
              <div className="stats-card-body">
                <p>#Sent</p>
                <p className="stats-card-value">{allTimeStats.totalSent}</p>
              </div>
            </article>

            <article className="stats-card">
              <div className="stats-card-body">
                <p>#Received</p>
                <p className="stats-card-value">{allTimeStats.totalReceived}</p>
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
          <div className="stats-select-group">
            <label htmlFor="fd">
              Direction:
              <p className="required">*</p>
            </label>
            <Select
              inputId="fd"
              name="dir"
              placeholder="choose direction..."
              defaultValue={directionOptions[0]} /* sent */
              options={directionOptions}
              onChange={handleDirChange}
              isRequired
              isSearchable
              isClearable
            />
          </div>
        </div>
      </section>

      <section className="section">
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
                      <td>{stat["name"]}</td>
                      <td>{stat["time_interval"]}</td>
                      <td>{filterCriterias.dir}</td>
                      <td>{stat["total"]}</td>
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

export default StatisticsPointMng;
