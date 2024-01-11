import React, { useState } from "react";

import Form from "./Form";
import Table from "./Table";

function Create({
  name,
  api,
  requiredInputs,
  requiredChoices,
  optionalInputs,
  optionalChoices,
  propertyOrder,
}) {
  const [isCreated, setIsCreated] = useState(false);
  const [createdList, setCreatedList] = useState({});

  return (
    <div className="section-container">
      <Form
        name={name}
        api={api}
        requiredInputs={requiredInputs}
        requiredChoices={requiredChoices}
        optionalInputs={optionalInputs}
        optionalChoices={optionalChoices}
        propertyOrder={propertyOrder}
        setIsChanged={setIsCreated}
        setChangedList={setCreatedList}
      />

      {/* other sections here... */}
      {isCreated && (
        <Table displayList={createdList} propertyOrder={propertyOrder} />
      )}
    </div>
  );
}

export default Create;
