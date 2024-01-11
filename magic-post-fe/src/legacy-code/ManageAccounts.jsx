import React from "react";
import { useCallback } from "react";

function ManageAccounts() {
  return <div>ManageAccounts</div>;

  const fetchAccounts = useCallback(async () => {
    setLoading = true;

    try {
      const res = await fetch(SERVER_URL + "/api/accounts");
      const json = await res.json();

      console.log(json);

      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  });

  useEffect(() => {
    fetchAccounts();
  }, fetchAccounts);

  return <div>ManageAccounts</div>;
}

export default ManageAccounts;
