import React, { useState, useEffect, useRef, useMemo } from "react";
import Select from "react-select";

import { normalize, SERVER_URL } from "../../data";

import Table from "./Table";
import { useGlobalContext } from "../../context/GlobalContext";

function Form({
  name,
  api,
  requiredInputs,
  requiredChoices,
  optionalInputs,
  optionalChoices,
  editId,
  item,

  setIsChanged,
  setChangedList,
}) {
  const { user } = useGlobalContext();
  const [alert, setAlert] = useState({ show: false, status: "", msg: "" });

  const REQUIRED_INPUTS = useMemo(
    () =>
      requiredInputs.reduce((prev, current) => {
        return { ...prev, [current]: `${editId ? item[current] : ""}` };
      }, {}),
    [requiredInputs, item]
  );

  const REQUIRED_CHOICES = useMemo(
    () =>
      requiredChoices.reduce((prev, current) => {
        return { ...prev, [current]: `${editId ? item[current] : ""}` };
      }, {}),
    [requiredChoices, item]
  );

  const OPTIONAL_IMPUTS = useMemo(
    () =>
      optionalInputs.reduce((prev, current) => {
        return { ...prev, [current]: `${editId ? item[current] : ""}` };
      }, {}),
    [optionalInputs, item]
  );

  const OPTIONAL_CHOICES = useMemo(
    () =>
      optionalChoices.reduce((prev, current) => {
        return { ...prev, [current]: `${editId ? item[current] : ""}` };
      }, {}),
    [optionalChoices, item]
  );

  const [requiredOptions, setRequiredOptions] = useState(
    requiredChoices.reduce((prev, current) => {
      return { ...prev, [current]: [] };
    }, {})
  ); // load once, unchanged

  const [optionalOptions, setOptionalOptions] = useState(
    optionalChoices.reduce((prev, current) => {
      return { ...prev, [current]: [] };
    }, {})
  ); // load once, unchanged

  const sendData = useRef({
    ...REQUIRED_INPUTS,
    ...OPTIONAL_IMPUTS,
    ...REQUIRED_CHOICES,
    ...OPTIONAL_CHOICES,
  });
  // ! don't need to manually set sendData.current to all item if this is Form edit because I've set them in 4 initial state arrays

  useEffect(() => {
    const url =
      SERVER_URL +
      `${
        api.includes("<int:mng_id>")
          ? api.replace("<int:mng_id>", user["id"])
          : api
      }`; // ! get unique values in requiredChoices

    const options = {
      method: "GET",
      credentials: "include", // ! very important, don't forget
    };

    const constructChoices = (choices, setOptions) => {
      choices.forEach((choice) => {
        fetch(
          url + `${url.includes("?") ? "&" : "?"}property=${choice}`,
          options
        )
          .then((res) => res.json())
          .then((json) => {
            if (json["status"] === "fail") {
              throw Error(json["data"]["msg"]);
            }

            console.log(json["data"][choice]); // ! [choice], reflect BE

            const finalOptions = json["data"][choice].map((val) => {
              // ! Remember: [choice]

              return {
                label: val,
                value: val,
              };
            });

            // add current option as a valid option among unique options
            if (
              editId && // only add option if I am editing
              item[choice] && // avoid adding blank option as a valid option
              finalOptions.filter(
                (option) =>
                  option.value === item[choice] || option.label === item[choice]
              ).length === 0 // avoid adding duplicate option as a valid option
            ) {
              finalOptions.push({
                label: item[choice],
                value: item[choice],
              });
            }

            console.log(finalOptions); // debug

            setOptions((oldOptions) => {
              return { ...oldOptions, [choice]: finalOptions };
            });
          })
          .catch((err) => console.error(err));
      });
    };

    constructChoices(requiredChoices, setRequiredOptions);
    constructChoices(optionalChoices, setOptionalOptions);
  }, []);

  const handleInputChange = (e) => {
    sendData.current = { ...sendData.current, [e.target.name]: e.target.value };
    console.log(sendData.current);
  };

  const handleChoiceChange = (e, name) => {
    if (!e) {
      sendData.current = { ...sendData.current, [name]: "" };
      console.log(sendData.current);
      return;
    }

    sendData.current = { ...sendData.current, [name]: e.value }; // or label, either will work
    console.log(sendData.current);
  };

  const handleSubmit = (e) => {
    // console.log("Firing from Form");

    // TODO: a FE validation for unique values, might add a uniqueInputs in TEMPLATE in data.jsx
    // For now, i'm rely on database unique constraint

    e.preventDefault();

    const url =
      SERVER_URL +
      `${
        api.includes("<int:mng_id>")
          ? api.replace("<int:mng_id>", user["id"])
          : api
      }` +
      `${editId ? `/${editId}` : ""}`;

    const options = {
      method: `${editId ? "PUT" : "POST"}`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify({
        data: { ...sendData.current, ["supervisor_id"]: user["id"] }, // ! note: I wrapped it inside 'data' key, and sendData don't have to reflect BE since I'm also sending sender_id
      }),
      credentials: "include", // ! very important, don't forget
    };

    console.log({ ...sendData.current, ["supervisor_id"]: user["id"] }); // debug

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

        setAlert({
          show: true,
          status: json["status"],
          msg: json["data"]["msg"],
        });

        console.log(json["data"]["item"]);

        setIsChanged(true);
        setChangedList([{ ...json["data"]["item"], [editId]: editId }]); // ! an array with 1 item is set here

        console.log([{ ...json["data"]["item"], [editId]: editId }]);

        // console.log(json["data"]["msg"]); // debug
        // console.log(json["data"]["id"]); //debug
      })
      .catch((err) => console.error(err));
  };

  return (
    <section className="section">
      <div className="section-title">
        <h1>
          {editId ? "Edit" : "Create New"} {name}
        </h1>
      </div>
      <div className="section-body collapse show">
        <form onSubmit={handleSubmit}>
          <div className="form-outer">
            {/* add id if it's editing */}
            {editId && (
              <div className="form-container">
                <label htmlFor="id">
                  Id<strong className="required">*</strong>
                </label>

                <input
                  type="text"
                  id="id"
                  name="id"
                  value={editId}
                  disabled
                  required
                />
              </div>
            )}

            {/* must being type */}
            {requiredInputs.map((input, index) => {
              return (
                <div key={index} className="form-container">
                  <label htmlFor={input}>
                    {editId ? "New" : ""} {normalize(input)}
                    <strong className="required">*</strong>
                  </label>
                  <input
                    id={input}
                    name={input}
                    type="text"
                    placeholder={`write ${input.replace(
                      /[^A-Za-z0-9]/g,
                      " "
                    )} here`}
                    onChange={handleInputChange}
                    defaultValue={editId ? item[input] : ""}
                    required
                  />
                </div>
              );
            })}

            {/* can type or not */}
            {optionalInputs.map((input, index) => {
              return (
                <div key={index} className="form-container">
                  <label htmlFor={input}>
                    {editId ? "New" : ""} {normalize(input)}{" "}
                    {/* no require here */}
                  </label>
                  <input
                    id={input}
                    name={input}
                    type="text"
                    placeholder={`write ${input.replace(
                      /[^A-Za-z0-9]/g,
                      " "
                    )} here`}
                    onChange={handleInputChange}
                    defaultValue={editId ? item[input] : ""}
                    // no require here
                  />
                </div>
              );
            })}

            {/* must be chosen, can't freely input */}
            {requiredChoices.map((choice, index) => {
              console.log(index);
              return (
                <div key={index} className="form-container">
                  <label htmlFor={`${choice}${index}`}>
                    {editId ? "New" : ""} {normalize(choice)}
                    <strong className="required">*</strong>
                  </label>
                  <Select
                    inputId={`${choice}${index}`}
                    name={choice}
                    className="form-select"
                    defaultValue={
                      editId && item[choice]
                        ? {
                            label: item[choice],
                            value: item[choice],
                          }
                        : null
                    } // Default value is considered a valid value, even when label and value is empty string, so we don't use empty string like label: item[optional] || ""
                    options={
                      // editId && item[choice]
                      //   ? [
                      //       ...requiredOptions[choice],
                      //       {
                      //         label: item[choice],
                      //         value: item[choice],
                      //       },
                      //     ]
                      //   : requiredOptions[choice]
                      requiredOptions[choice]
                    } // when editing, existing value is also a valid option so you need to put that inside as well
                    // ! or, you can change the fetch() function that used to fetch unique options to include it as well
                    isSearchable
                    isClearable
                    required
                    onChange={(e) => handleChoiceChange(e, choice)}
                    placeholder={`Choose ${choice.replace(
                      /[^A-Za-z0-9]/g,
                      " "
                    )}...`}
                  />
                </div>
              );
            })}

            {/* optional, i think */}
            {optionalChoices.map((optional, index) => {
              return (
                <div key={index} className="form-container">
                  <label htmlFor={`${optional}${index}`}>
                    {editId ? "New" : ""} {normalize(optional)}
                    {/* no require here */}
                  </label>
                  <Select
                    inputId={`${optional}${index}`}
                    name={optional}
                    className="form-select"
                    defaultValue={
                      editId && item[optional]
                        ? {
                            label: item[optional],
                            value: item[optional],
                          }
                        : null
                    }
                    options={
                      // editId && item[optional]
                      //   ? [
                      //       ...optionalOptions[optional],
                      //       {
                      //         label: item[optional],
                      //         value: item[optional],
                      //       },
                      //     ]
                      //   : optionalOptions[optional]
                      optionalOptions[optional]
                    }
                    isSearchable
                    isClearable
                    onChange={(e) => handleChoiceChange(e, optional)}
                    placeholder={`Choose ${optional.replace(
                      /[^A-Za-z0-9]/g,
                      " "
                    )}...`}
                    // ! no required here
                  />
                </div>
              );
            })}
          </div>
          {alert.show && (
            <p className={`alert alert-${alert.status}`}>{alert.msg}</p>
          )}
          <input type="submit" className="add-btn" value="+" />
        </form>
      </div>
    </section>
  );
}

export default Form;
