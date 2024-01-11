// import { useCallback } from "react";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { SERVER_URL, useGlobalContext } from "../../../context";
import { FaCheckSquare, FaRegEdit } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FaPlus, FaCheck } from "react-icons/fa6";
import { MdRemoveCircle } from "react-icons/md";

import Select from "react-select";
import CreatableSelect from "react-select/creatable";

import {
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa6";

const row_option = () => {
  const options = [];
  for (let i = 1; i <= 5; ++i) {
    options.push({
      label: i,
      value: i,
    });
  }
  return options;
};

// const NewPointModal = () => {
//   const { isModalOpen, closeModal } = useGlobalContext();

//   return (
//     <div className={isModalOpen ? 'modal-overlay show-modal' : 'modal-overlay'}>
//       <div className="modal-container">
//         <h3>New Point</h3>
//         <button className="close-modal-btn" onClick={closeModal}></button>
//       </div>
//     </div>
//   )
// }

const ManagePoints = () => {
  // filter
  const [filterCriterias, setFilterCriterias] = useState({
    type: "",
    city: "",
    district: "",
    ward: "",
  });

  // clear last selected value
  const filterCityButton = useRef();
  const filterDistrictButton = useRef();
  const filterWardButton = useRef();

  // toggle filter/search section
  const [isFilterBodyVisible, setIsFilterBodyVisible] = useState(false);
  const [isSearchBodyVisible, setIsSearchBodyVisible] = useState(false);

  // dynamic searching
  const searchBar = useRef();
  const [searchTerm, setSearchTerm] = useState("");

  // store points and display
  const [tradePoints, setTradePoints] = useState([]);
  const [consolPoints, setConsolPoints] = useState([]);

  const [displayPoints, setDisplayPoints] = useState([]);

  // fine-grained extract options
  const [filterWardOptions, setFilterWardOptions] = useState([]);
  const [filterDistrictOptions, setFilterDistrictOptions] = useState([]);
  const [filterCityOptions, setFilterCityOptions] = useState([]);

  // ajax handling
  const { loading, setLoading } = useGlobalContext();

  // handling page navigation
  const [maxPageNum, setMaxPageNum] = useState(5);
  const [currentPageNum, setCurrentPageNum] = useState(1);

  // add point
  const [uniqConsolPointNames, setUniqConsolPointNames] = useState([]);
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [newPoint, setNewPoint] = useState({
    type: "",
    name: "",
    address: "",
    ward: "",
    district: "",
    city: "",
    associated: "",
  });
  const [alert, setAlert] = useState({
    show: false,
    status: "",
    msg: "",
  });

  //edit point
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(-1);

  // Fetch all, then filter at front-end
  // Might not very optimized, but it's the easiest way to do
  // Learn to filter at back-end later
  const fetchPoints = useCallback(async () => {
    setLoading(true);
    try {
      const url = SERVER_URL + "/api/points";
      const options = {
        method: "GET",
        credentials: "include", // ! very important, don't forget
      };

      const res = await fetch(url, options);
      const json = await res.json();

      // debug
      // console.log(json["data"]["trade_points"]);
      // console.log(json["data"]["consol_points"]);

      const citySet = new Set(
        json["data"]["trade_points"].map((tradePoint) => tradePoint.city)
      );

      const cityOptArr = [{ label: "", value: "" }];
      for (const city of citySet) {
        cityOptArr.push({
          value: city,
          label: city,
        });
      }

      setTradePoints(json["data"]["trade_points"]);
      setConsolPoints(json["data"]["consol_points"]);

      setFilterCityOptions(cityOptArr);
      setFilterCriterias({
        ...filterCriterias,
        type: "tp",
      });

      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  }, []);

  const handlePointTypeChange = (e) => {
    const chosenPoints = e.target.value === "tp" ? tradePoints : consolPoints;

    const citySet = new Set(chosenPoints.map((tradePoint) => tradePoint.city));

    const cityOptArr = [{ label: "", value: "" }];
    for (const city of citySet) {
      cityOptArr.push({
        value: city,
        label: city,
      });
    }

    // console.log(cityOptArr);

    // clear last selected value
    filterCityButton.current.clearValue();
    filterDistrictButton.current.clearValue();
    filterWardButton.current.clearValue();

    setFilterCityOptions(cityOptArr);
    setFilterDistrictOptions([]);
    setFilterWardOptions([]);
    setFilterCriterias({
      ...filterCriterias,
      type: e.target.value,
      city: "",
      district: "",
      ward: "",
    });

    setCurrentPageNum(1);
  };

  const handleCitySelect = (e) => {
    if (!e) {
      setFilterCityOptions([]);
      setFilterDistrictOptions([]);
      setFilterWardOptions([]);
      setFilterCriterias({
        ...filterCriterias,
        city: "",
        district: "",
        ward: "",
      });
      return; //  accidentally called when calling filterCityButton.current.clearValue();
    }

    if (
      filterCityButton.current.props.value &&
      e.value === filterCityButton.current.props.value.value
    ) {
      return; // select the currently selected
    }

    if (e.value === "") {
      filterDistrictButton.current.clearValue();
      filterWardButton.current.clearValue();
    }

    const chosenPoints =
      filterCriterias.type === "tp" ? tradePoints : consolPoints;

    const districtSet = new Set(
      chosenPoints.map((point) => {
        if (point.city === e.value) {
          return point.district;
        }
      })
    );

    const districtOptArr = [{ label: "", value: "" }];
    for (const district of districtSet) {
      districtOptArr.push({
        value: district,
        label: district,
      });
    }

    setFilterDistrictOptions(districtOptArr);
    setFilterWardOptions([]);
    setFilterCriterias({
      ...filterCriterias,
      city: e.value,
      district: "",
      ward: "",
    });
  };

  const handleDistrictSelect = (e) => {
    if (!e) {
      return; //  accidentally called when calling filterDistrictButton.current.clearValue();
    }

    if (
      filterDistrictButton.current.props.value &&
      e.value === filterDistrictButton.current.props.value.value
    ) {
      return; // select the currently selected
    }

    if (e.value === "") {
      filterWardButton.current.clearValue();
    }

    const chosenPoints =
      filterCriterias.type === "tp" ? tradePoints : consolPoints;

    const wardSet = new Set(
      chosenPoints.map((point) => {
        if (point.city === filterCriterias.city && point.district === e.value) {
          return point.ward;
        }
      })
    );

    const wardOptArr = [{ label: "", value: "" }];
    for (const ward of wardSet) {
      wardOptArr.push({
        label: ward,
        value: ward,
      });
    }

    setFilterWardOptions(wardOptArr);
    setFilterCriterias({
      ...filterCriterias,
      district: e.value,
      ward: "",
    });
  };

  const handleWardSelect = (e) => {
    if (!e) {
      // setFilterWardOptions([]);
      // setFilterCriterias({ ...filterCriterias, ward: "" });
      return; // clear value either when: using clear button or manually at handlePointTypeChange()
    }

    if (
      filterWardButton.current.props.value &&
      e.value === filterWardButton.current.props.value.value
    ) {
      return; // select the currently selected
    }

    setFilterCriterias({
      ...filterCriterias,
      ward: e.value,
    });
  };

  const searchPoints = useCallback(() => {
    const chosenPoints =
      filterCriterias.type === "tp" ? tradePoints : consolPoints;

    const finalDisplayPoints = chosenPoints.filter((point) => {
      return (
        point.city.includes(searchTerm) ||
        point.district.includes(searchTerm) ||
        point.ward.includes(searchTerm)
      );
    });

    setDisplayPoints(finalDisplayPoints);
  }, [searchTerm]);

  const filterPoints = useCallback(async () => {
    const chosenPoints =
      filterCriterias.type === "tp" ? tradePoints : consolPoints;

    const finalDisplayPoints = chosenPoints
      .filter((point) => {
        if (filterCriterias.city) return point.city === filterCriterias.city;
        return true; /* if no criteria, return all */
      })
      .filter((point) => {
        if (filterCriterias.district)
          return point.district === filterCriterias.district;
        return true; /* if no criteria, return all */
      })
      .filter((point) => {
        if (filterCriterias.ward) return point.ward === filterCriterias.ward;
        return true; /* if no criteria, return all */
      });

    setDisplayPoints(finalDisplayPoints);
  }, [filterCriterias]);

  useEffect(() => {
    fetchPoints();

    return () => {
      // clean up after reload
      setIsAddingPoint(false);
      setNewPoint({
        type: "",
        name: "",
        address: "",
        ward: "",
        district: "",
        city: "",
        associated: "",
      });
      setAlert({
        show: false,
        status: "",
        msg: "",
      });
    };
  }, []);

  useEffect(() => {
    searchPoints();
  }, [searchTerm, searchPoints]);

  useEffect(() => {
    filterPoints();
  }, [filterCriterias, filterPoints]);

  const toggleFilterVisibility = (e) => {
    setIsFilterBodyVisible((state) => !state);
  };

  const toggleSearchVisibility = (e) => {
    setIsSearchBodyVisible((state) => !state);
  };

  const handleSearchBarChange = (e) => {
    setSearchTerm(searchBar.current.value);
  };

  const handleRowOptionSelect = (e) => {
    setMaxPageNum(e.value);
  };

  const backPage = (e) => {
    setCurrentPageNum((currentPageNum) =>
      currentPageNum === 1 ? currentPageNum : currentPageNum - 1
    );
  };

  const nextPage = (e) => {
    setCurrentPageNum((currentPageNum) =>
      displayPoints.length > currentPageNum * maxPageNum
        ? currentPageNum + 1
        : currentPageNum
    );
  };

  const handleAddPoint = (e) => {
    setIsAddingPoint(true);

    const tmpArr = [...new Set(consolPoints.map((point) => point.consol_name))];
    setUniqConsolPointNames(tmpArr);

    // set default value, because button default selected not trigger onChange event
    setNewPoint({ ...newPoint, type: "Trading", associated: tmpArr[0] });
  };

  const addPoint = async (e) => {
    let errMsg = "";
    Object.keys(newPoint).forEach((key) => {
      if (!newPoint[key]) {
        errMsg += `${key.charAt(0).toUpperCase() + key.slice(1)}, `;
      }
    });

    if (errMsg) {
      errMsg = errMsg.substring(0, errMsg.length - 2) + " required!";
      setAlert({ show: true, status: "fail", msg: errMsg });
      return;
    }

    try {
      const url =
        SERVER_URL +
        `/api/points${newPoint.type === "Trading" ? "/trades" : "/consols"}`;
      const options = {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({
          data: newPoint,
        }),
        credentials: "include", // ! very important, don't forget
      };

      const res = await fetch(url, options);
      const json = await res.json();

      setAlert({
        show: true,
        status: json["status"],
        msg: json["data"]["msg"],
      });

      fetchPoints(); // refresh point
    } catch (err) {
      console.error(err);
    }
  };

  const editPoint = (id) => {
    setIsEditing(true);
    setEditId(id);
  };

  const stopEdit = () => {
    setIsEditing(false);
    setEditId(-1);
  };

  const confirmEdit = () => {
    setIsEditing(false);
    setEditId(-1);
  };

  const deletePoint = (id) => {};

  const handleAddPointInput = (e) => {
    setAlert({ show: false, msg: "" });
    setNewPoint({ ...newPoint, [e.target.name]: e.target.value });
    console.log({ ...newPoint, [e.target.name]: e.target.value });
  };

  const handleEditPointInput = (e) => {};

  return (
    <div className="dashboard-content-container">
      <div className="dashboard-helper">
        <section className="dashboard-content-section">
          <div className="dashboard-section-title">
            <h2>Filter</h2>
            <button
              className="dashboard-section-togglebtn"
              value="filter"
              onClick={toggleFilterVisibility}
            >
              {isFilterBodyVisible ? <FaChevronDown /> : <FaChevronUp />}
            </button>
          </div>

          <div
            className={`${
              isFilterBodyVisible
                ? "dashboard-section-body show"
                : "dashboard-section-body"
            }`}
          >
            <div className="dashboard-point-container">
              <h3>Point Types: </h3>

              <input
                type="radio"
                name="point-type"
                id="tp"
                value="tp"
                checked={filterCriterias.type === "tp"}
                onChange={handlePointTypeChange}
                className="dashboard-point-btn"
              />
              <label htmlFor="tp" className="dashboard-point-label">
                Trading Point
              </label>

              <input
                type="radio"
                name="point-type"
                id="cp"
                value="cp"
                checked={filterCriterias.type === "cp"}
                onChange={handlePointTypeChange}
                className="dashboard-point-btn"
              />
              <label htmlFor={"cp"} className="dashboard-point-label">
                Consolidation Point
              </label>
            </div>

            <div className="dashboard-select-outer-container">
              <div className="dashboard-select-container">
                <label htmlFor="city">
                  <h3 className="dashboard-select-label">City: </h3>
                </label>
                <Select
                  inputId="city"
                  name="city"
                  className="dashboard-select-btn"
                  defaultValue={filterCityOptions[0]}
                  options={filterCityOptions}
                  isSearchable={true}
                  isClearable={false}
                  isDisabled={!filterCriterias.type}
                  onChange={handleCitySelect}
                  placeholder="Choose city..."
                  ref={filterCityButton}
                />
              </div>

              <div className="dashboard-select-container">
                <label htmlFor="district">
                  <h3 className="dashboard-select-label">District: </h3>
                </label>
                <Select
                  name="district"
                  inputId="district"
                  className="dashboard-select-btn"
                  defaultValue={filterDistrictOptions[0]}
                  options={filterDistrictOptions}
                  isSearchable={true}
                  isClearable={false}
                  isDisabled={!filterCriterias.city}
                  onChange={handleDistrictSelect}
                  placeholder="Choose district..."
                  ref={filterDistrictButton}
                />
              </div>

              <div className="dashboard-select-container">
                <label htmlFor="ward">
                  <h3 className="dashboard-select-label">Ward: </h3>
                </label>
                <Select
                  name="ward"
                  inputId="ward"
                  className="dashboard-select-btn"
                  defaultValue={filterWardOptions[0]}
                  options={filterWardOptions}
                  isSearchable={true}
                  isClearable={false}
                  isDisabled={!filterCriterias.district}
                  onChange={handleWardSelect}
                  placeholder="Choose ward..."
                  ref={filterWardButton}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-content-section">
          <div className="dashboard-section-title">
            <h2>Search</h2>
            <button
              className="dashboard-section-togglebtn"
              value="filter"
              onClick={toggleSearchVisibility}
            >
              {isSearchBodyVisible ? <FaChevronDown /> : <FaChevronUp />}
            </button>
          </div>

          <div
            className={`${
              isSearchBodyVisible
                ? "dashboard-section-body show"
                : "dashboard-section-body"
            }`}
          >
            <input
              className="dashboard-search-bar"
              type="text"
              placeholder="e.g. Thanh Xuan"
              value={searchTerm}
              ref={searchBar}
              onChange={handleSearchBarChange}
            />
          </div>
        </section>
      </div>

      {console.log(displayPoints)}

      <section className="dashboard-content-section">
        <div className="dashboard-section-title">
          <h2>List of MagicPost's Points</h2>
          <nav className="dashboard-page-nav">
            <p>
              {(currentPageNum - 1) * maxPageNum + 1} -{" "}
              {Math.min(currentPageNum * maxPageNum, displayPoints.length)} of{" "}
              {displayPoints.length} displays
            </p>

            <Select
              options={row_option()}
              className="dashboard-max-page-btn"
              inputId="row-option"
              name="row-option"
              isSearchable={true}
              isClearable={false}
              defaultValue={maxPageNum}
              onChange={handleRowOptionSelect}
            />

            <button onClick={backPage}>
              <FaChevronLeft />
            </button>
            <p className="dashboard-page-num">{currentPageNum}</p>
            <button onClick={nextPage}>
              <FaChevronRight />
            </button>
          </nav>
        </div>

        <div className="dashboard-section-body show">
          <table cellSpacing="0" cellPadding="0">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" />
                </th>
                <th>
                  <p>Point Type</p>
                </th>
                <th>
                  <p>ID</p>
                </th>
                <th>
                  <p>Point Name</p>
                </th>
                <th>
                  <p>Address</p>
                </th>
                <th>
                  <p>Ward</p>
                </th>
                <th>
                  <p>District</p>
                </th>
                <th>
                  <p>City</p>
                </th>
                {/* only added if trade point is chosen */}
                {filterCriterias.type === "tp" ? (
                  <th>Associated Consolidation Point</th>
                ) : (
                  <th>Associated Trading Points</th>
                )}
                <th>
                  <p>Action</p>
                </th>
              </tr>
            </thead>

            <tbody>
              {displayPoints.map((point, index) => {
                if (
                  index >= maxPageNum * currentPageNum ||
                  index < maxPageNum * (currentPageNum - 1)
                )
                  return;

                return (
                  <tr key={index}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td>
                      {filterCriterias.type === "tp"
                        ? "Trading"
                        : "Consolidation"}
                    </td>
                    <td>{point.id}</td>

                    {isEditing && editId === point.id && (
                      <td>
                        <input
                          onChange={handleEditPointInput}
                          type="text"
                          value={
                            filterCriterias.type === "tp"
                              ? point.trade_name
                              : point.consol_name
                          }
                        />
                      </td>
                    )}

                    <td
                      className={`col-name ${
                        point.id === editId ? "hide" : ""
                      }`}
                    >
                      {filterCriterias.type === "tp"
                        ? point.trade_name
                        : point.consol_name}
                    </td>

                    {isEditing && editId === point.id && (
                      <td>
                        <input
                          type="text"
                          value={point.address}
                          onChange={handleEditPointInput}
                        />
                      </td>
                    )}

                    <td
                      className={`col-addr ${
                        point.id === editId ? "hide" : ""
                      }`}
                    >
                      {point.address}
                    </td>

                    {isEditing && editId === point.id && (
                      <td>
                        <input
                          type="text"
                          value={point.ward}
                          onChange={handleEditPointInput}
                        />
                      </td>
                    )}

                    <td className={`${point.id === editId ? "hide" : ""}`}>
                      {point.ward}
                    </td>

                    {isEditing && editId === point.id && (
                      <td>
                        <input
                          type="text"
                          value={point.district}
                          onChange={handleEditPointInput}
                        />
                      </td>
                    )}

                    <td className={`${point.id === editId ? "hide" : ""}`}>
                      {point.district}
                    </td>

                    {isEditing && editId === point.id && (
                      <td>
                        <input
                          type="text"
                          value={point.city}
                          onChange={handleEditPointInput}
                        />
                      </td>
                    )}

                    <td className={`${point.id === editId ? "hide" : ""}`}>
                      {point.city}
                    </td>

                    {filterCriterias.type === "tp" ? (
                      <>
                        {isEditing && editId === point.id && (
                          <td>
                            <input
                              type="text"
                              value={point.consol_name}
                              onChange={handleEditPointInput}
                            />
                          </td>
                        )}

                        <td
                          className={`col-assc-cp ${
                            point.id === editId ? "hide" : ""
                          }`}
                        >
                          {point.consol_name}
                        </td>
                      </>
                    ) : (
                      <>
                        {isEditing && editId === point.id && (
                          <td>
                            <input
                              type="text"
                              value={point.list_tp}
                              onChange={handleEditPointInput}
                            />
                          </td>
                        )}

                        <td
                          className={`col-assc-tp ${
                            point.id === editId ? "hide" : ""
                          }`}
                        >
                          {point.list_tp}
                        </td>
                      </>
                    )}

                    <td className="nowrap">
                      {isEditing && editId === point.id && (
                        <>
                          <button onClick={stopEdit}>
                            <MdRemoveCircle />
                          </button>
                          <button onClick={confirmEdit}>
                            <FaCheckSquare />
                          </button>
                        </>
                      )}

                      <button
                        className={`edit-btn ${
                          point.id === editId ? "hide" : ""
                        }`}
                        onClick={(e) => editPoint(point.id)}
                      >
                        <FaRegEdit />
                      </button>
                      <button
                        className={`delete-btn ${
                          point.id === editId ? "hide" : ""
                        }`}
                        onClick={(e) => deletePoint(point.id)}
                      >
                        <RiDeleteBin5Line />
                      </button>
                    </td>
                  </tr>
                );
              })}
              <tr className={isAddingPoint ? "hide" : ""}>
                <td colSpan={filterCriterias.type === "tp" ? 9 : 8}>
                  <button className="add-btn" onClick={handleAddPoint}>
                    <FaPlus />
                  </button>
                </td>
              </tr>
              {isAddingPoint && (
                <tr className="add-row">
                  <td colSpan={3}>
                    <select name="type" onChange={handleAddPointInput}>
                      <option value="Trading">Trading</option>
                      <option value="Consolidation">Consolidation</option>
                    </select>
                  </td>
                  <td>
                    <input
                      name="name"
                      type="text"
                      placeholder="name..."
                      value={newPoint.name}
                      onChange={handleAddPointInput}
                    />
                  </td>
                  <td>
                    <input
                      name="address"
                      type="text"
                      placeholder="address..."
                      value={newPoint.address}
                      onChange={handleAddPointInput}
                    />
                  </td>
                  <td>
                    <input
                      name="ward"
                      type="text"
                      placeholder="ward..."
                      value={newPoint.ward}
                      onChange={handleAddPointInput}
                    />
                  </td>
                  <td>
                    <input
                      name="district"
                      type="text"
                      placeholder="district..."
                      value={newPoint.district}
                      onChange={handleAddPointInput}
                    />
                  </td>
                  <td>
                    <input
                      name="city"
                      type="text"
                      placeholder="city..."
                      value={newPoint.city}
                      onChange={handleAddPointInput}
                    />
                  </td>
                  <td>
                    <select
                      name="associated"
                      onChange={handleAddPointInput}
                      className="select-assc-point"
                      disabled={newPoint.type === "Consolidation"}
                    >
                      {uniqConsolPointNames.map((point, index) => {
                        return (
                          <option key={index} value={point}>
                            {point}
                          </option>
                        );
                      })}
                    </select>
                  </td>

                  <td>
                    <button className="accept-btn" onClick={addPoint}>
                      <FaCheck />
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {alert.show && (
            <p
              className={`add-alert ${
                alert.status === "success" ? "success" : "fail"
              }`}
            >
              {alert.msg}
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default ManagePoints;
