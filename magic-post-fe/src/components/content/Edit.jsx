import React, { useState } from "react";
import { useLocation } from "react-router-dom";

import Form from "./Form";
import Table from "./Table";

const Edit = ({
  api,
  requiredInputs,
  optionalInputs,
  optionalChoices,
  requiredChoices,
  propertyOrder,
  name,
}) => {
  const location = useLocation();

  // console.log(location.state.editId);
  // console.log(location.state.item);

  const [isEdited, setIsEdited] = useState(false);
  const [editedList, setEditedList] = useState([]);

  console.log(requiredInputs);

  return (
    <div className="section-container">
      <Form
        name={name}
        api={api}
        requiredInputs={requiredInputs}
        optionalInputs={optionalInputs}
        requiredChoices={requiredChoices}
        optionalChoices={optionalChoices}
        propertyOrder={propertyOrder}
        setIsChanged={setIsEdited}
        setChangedList={setEditedList}
        editId={location.state.editId} // only exists if pressed Edit button in List
        item={location.state.item} // only exists if pressed Edit button in List
      />
      {/* other sections here... */}
      {isEdited && (
        <Table
          displayList={editedList}
          setDisplayList={setEditedList}
          propertyOrder={propertyOrder}
          currentPageNum={1} /* only display 1 page */
          setCurrentPageNum={() => {}} /* no need to change page */
        />
      )}
    </div>
  );
};

export default Edit;
