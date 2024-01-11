import React, { useState, useCallback, useEffect } from "react";

import Filter from "./Filter";
import Search from "./Search";
import Table from "./Table";

import { SERVER_URL, normalize, randomColor } from "../../data";
import { useGlobalContext } from "../../context/GlobalContext";

// import { ListProvider } from "../../context/ListContext";

// NOTE: using Math.random() to ensure different routing to the same Components but different Instances
export const ListFactory = (props, key) => {
  return <List key={key} {...props} />;
};

const List = ({ name, api, filters, propertyOrder, edit }) => {
  const { user } = useGlobalContext();
  const [searchCriteria, setSearchCriteria] = useState("");
  const [filterCriteria, setFilterCriteria] = useState(
    filters.reduce((prev, current) => {
      return { ...prev, [current]: "" };
    }, {})
  );

  const [uniqueOptions, setUniqueOptions] = useState(
    filters.reduce((prev, current) => {
      return { ...prev, [current]: [] };
    }, {})
  );

  /* currentPageNum shares between Search, Filter, Table ********** */

  const [currentPageNum, setCurrentPageNum] = useState(1);
  const resetPageNum = () => {
    setCurrentPageNum(1);
  };

  const [itemList, setItemList] = useState([]); // load once, unchanged
  const [displayList, setDisplayList] = useState([]);

  const filterList = useCallback(() => {
    let tmpDisplayList = itemList;
    for (const filter of filters) {
      tmpDisplayList = tmpDisplayList.filter((item) => {
        if (filterCriteria[filter]) {
          return item[filter] === filterCriteria[filter];
        }
        return true;
      });
    }

    setDisplayList(tmpDisplayList);
  }, [filterCriteria]);

  const searchList = useCallback(() => {
    if (!searchCriteria) {
      setDisplayList(itemList);
      return;
    }
    // console.log(searchCriteria);

    const tmpDisplayList = itemList.filter((item) => {
      return filters.reduce(
        (prev, current) =>
          prev ||
          item[current].toLowerCase().includes(searchCriteria.toLowerCase()),
        false
      );
    });

    // console.log(tmpDisplayList);

    setDisplayList(tmpDisplayList);
  }, [searchCriteria]);

  useEffect(() => {
    const initializeFilterOptions = (tmpItemList) => {
      let tmpUniqueOptions = filters.reduce((prev, current) => {
        return { ...prev, [current]: new Set() };
      }, uniqueOptions);

      // console.log(tmpUniqueOptions);

      tmpItemList.forEach((item) => {
        // console.log(item);
        filters.forEach((filter) => {
          tmpUniqueOptions = {
            ...tmpUniqueOptions,
            [filter]: tmpUniqueOptions[filter].add(item[filter]), // ! add(), not push()
          };
        });
      });

      console.log("yes", tmpUniqueOptions);

      let newUniqueOptions = {};

      for (const [key, values] of Object.entries(tmpUniqueOptions)) {
        // console.log(values);

        let propertyOptions = {};

        for (const value of values) {
          propertyOptions = {
            ...propertyOptions,
            [key]: [
              ...(propertyOptions[key] || []),
              {
                label: value,
                value: value,
              },
            ],
          };
          // console.log(propertyOptions);
        }
        newUniqueOptions = { ...newUniqueOptions, ...propertyOptions };
      }

      // console.log(newUniqueOptions);

      setUniqueOptions(newUniqueOptions);
    };

    const url =
      SERVER_URL +
      `${
        api.includes("<int:mng_id>")
          ? api.replace("<int:mng_id>", user["id"])
          : api
      }`;

    console.log(url);

    const options = {
      method: "GET",
      credentials: "include", // ! very important, don't forget
    };

    console.log(url);

    fetch(url, options)
      .then((res) => res.json())
      .then((json) => {
        if (json["status"] === "fail") {
          throw Error(json["data"]["msg"]);
        }

        console.log(json["data"]);

        setItemList(json["data"]);
        setDisplayList(json["data"]);
        initializeFilterOptions(json["data"]);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    filterList();
  }, [filterCriteria, filterList]);

  useEffect(() => {
    searchList();
  }, [searchCriteria, searchList]);

  return (
    <div className="section-container">
      <div className="section-row">
        <Filter
          filters={filters}
          setFilterCriteria={setFilterCriteria}
          uniqueOptions={uniqueOptions}
          resetPageNum={resetPageNum}
        />
        <Search
          setSearchCriteria={setSearchCriteria}
          resetPageNum={resetPageNum}
        />
      </div>
      <Table
        user={user}
        name={name}
        api={api}
        propertyOrder={propertyOrder}
        edit={edit}
        displayList={displayList}
        setDisplayList={setDisplayList}
        currentPageNum={currentPageNum}
        setCurrentPageNum={setCurrentPageNum}
      />
    </div>
  );
};

export default List;
