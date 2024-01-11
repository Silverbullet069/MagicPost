import React, { useState, useRef } from "react";

import { SECTION_TOGGLE_BUTTON_ICON } from "../../data.jsx";

function Search({ setSearchCriteria, resetPageNum }) {
  console.log("%c Search rerender :v", "color: red;");

  const [isVisible, setIsVisible] = useState(false);
  const searchBar = useRef();

  const toggleVisibility = () => {
    setIsVisible((state) => !state);
  };

  const handleSearchBarChange = (e) => {
    setSearchCriteria(searchBar.current.value);
    resetPageNum();
  };

  return (
    <section className="section search">
      <div className="section-title">
        <h2>Search</h2>
        <button
          className="section-togglebtn"
          value="search"
          onClick={toggleVisibility}
        >
          {isVisible
            ? SECTION_TOGGLE_BUTTON_ICON["down"]
            : SECTION_TOGGLE_BUTTON_ICON["up"]}
        </button>
      </div>

      <div className={`section-body collapse ${isVisible ? "show" : ""}`}>
        <input
          className="section-search-bar"
          type="text"
          placeholder="e.g. Thanh Xuan"
          ref={searchBar}
          onChange={handleSearchBarChange}
        />
      </div>
    </section>
  );
}

export default React.memo(Search);
