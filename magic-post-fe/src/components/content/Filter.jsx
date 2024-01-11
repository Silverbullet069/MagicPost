import React, { useState, useEffect } from "react";
import Select from "react-select";
import { randomColor, normalize, SECTION_TOGGLE_BUTTON_ICON } from "../../data";

function Filter({ setFilterCriteria, filters, uniqueOptions, resetPageNum }) {
  console.log("%c Filter rerender :v", randomColor());

  const [isVisible, setIsVisible] = useState(false);

  // useEffect(() => {

  // }, [itemList]); // ! NOTE: itemList might not load yet since Filter get render first, so it's crucial to add itemList here

  const toggleVisibility = (e) => {
    setIsVisible((state) => !state);
  };

  const handleFilterSelect = (filter, value) => {
    resetPageNum();
    setFilterCriteria((oldFilterCriteria) => {
      return {
        ...oldFilterCriteria,
        [filter]: value,
      };
    });
  };

  return (
    <section className="section filter">
      <div className="section-title">
        <h2>Filter</h2>
        <button
          className="section-togglebtn"
          value="filter"
          onClick={toggleVisibility}
        >
          {isVisible
            ? SECTION_TOGGLE_BUTTON_ICON["down"]
            : SECTION_TOGGLE_BUTTON_ICON["up"]}
        </button>
      </div>

      <div className={`section-body collapse ${isVisible ? "show" : ""}`}>
        <div className="select-outer-container">
          {filters.map((filter, index) => {
            return (
              <div key={index} className="select-container">
                <label htmlFor={filter}>
                  <h3 className="select-label">{normalize(filter)} :</h3>
                </label>

                <Select
                  inputId={filter}
                  name={filter}
                  className="select-btn"
                  defaultValue={
                    uniqueOptions[filter] ? uniqueOptions[filter][0] : ""
                  }
                  options={uniqueOptions[filter]}
                  isSearchable={true}
                  isClearable={true}
                  onChange={(e) => {
                    if (!e) {
                      handleFilterSelect(filter, "");
                      return;
                    }
                    handleFilterSelect(filter, e.value);
                  }}
                  placeholder={`Choose ${normalize(filter)}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default React.memo(Filter); // ! also very important when using useContext
