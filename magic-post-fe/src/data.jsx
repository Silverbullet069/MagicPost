import {
  FaChevronDown,
  FaChevronUp,
  FaChevronLeft,
  FaChevronRight,
  FaCircleChevronLeft,
  FaCircleChevronRight,
  FaPerson,
} from "react-icons/fa6";

import { MdAddHomeWork, MdEdit, MdListAlt } from "react-icons/md";

import { FaUsersCog, FaUserCog } from "react-icons/fa";

import {
  FaStore,
  FaChartColumn,
  FaBoxesStacked,
  FaBox,
  FaTrash,
  FaUsers,
  FaUserPlus,
  FaUserPen,
  FaUserSlash,
} from "react-icons/fa6";

import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";

export const SERVER_URL = "http://127.0.0.1:5000";
export const CLIENT_URL = "http://localhost:5173";

export const CLIENT_NAV_BUTTON_ICON = {
  left: <FaCircleChevronLeft />,
  right: <FaCircleChevronRight />,
};

export const SECTION_TOGGLE_BUTTON_ICON = {
  down: <FaChevronDown />,
  up: <FaChevronUp />,
};

export const SECTION_NAV_BUTTON_ICON = {
  left: <FaChevronLeft />,
  right: <FaChevronRight />,
};

export const normalize = (str) => {
  str = str.replace(/[^A-Za-z0-9]/g, " ");
  return str.replace(/\b\w/g, (c) => {
    return c.toUpperCase();
  });
};

export const randomColor = () => {
  const color = ["color: red;", "color: green;", "color:blue;"];
  return color[Math.floor(Math.random() * 3)];
};

export const arrayRange = (start, stop, step) =>
  Array.from(
    { length: (stop - start) / step + 1 },
    (value, index) => start + index * step
  );

export const makeOptionsFromString = (arr) => {
  // console.log(arr);

  return arr.map((item, idx) => {
    return {
      value: idx,
      label: item,
    };
  });
};

export const checkError = (json_status, json_msg) => {
  if (json_status === "fail") throw new Error(json_msg);
};

export const ACTION_BUTTONS = {
  edit: <FaRegEdit className="edit-btn" />,
  delete: <RiDeleteBin5Line className="delete-btn" />,
};

/* **************************************************************** */

const SENIOR_MNG_STATS_URL = "points/statistics";

export const TRADE_POINT_TEMPLATE = {
  key: "trade-point-template-key",
  name: "Trading Point",
  api: "/api/trades",
  list: "points/trades/list",
  create: "points/trades/create",
  edit: "points/trades/edit",
  delete: "points/trades/delete",
  propertyOrder: [
    "id",
    "trade_name",
    "address",
    "ward",
    "district",
    "city",
    "consolidation_name",
    "user_name",
  ],
  filters: ["city", "district", "ward", "consolidation_name"],
  requiredInputs: ["trade_name", "address", "ward", "district", "city"],
  optionalInputs: [],
  requiredChoices: ["consolidation_name"],
  optionalChoices: ["user_name"],
};

/* **************************************************************** */

export const CONSOL_POINT_TEMPLATE = {
  key: "consol-point-template-key",
  name: "Consolidation Point",
  api: "/api/consols",
  list: "points/consols/list",
  create: "points/consols/create",
  edit: "points/consols/edit",
  delete: "points/consols/delete",
  propertyOrder: [
    "id",
    "consolidation_name",
    "address",
    "ward",
    "district",
    "city",
    "trade_name_list",
    "user_name",
  ],
  filters: ["city", "district", "ward"],
  requiredInputs: ["consolidation_name", "address", "ward", "district", "city"],
  optionalInputs: [],
  requiredChoices:
    [] /* NOTE: we can specify "trade_name" here, but the idea of unassigned trade points is out of the scope */,
  optionalChoices: ["user_name"],
};
/* **************************************************************** */

export const TRADE_MNG_ACC_TEMPLATE = {
  key: "senior-trade-account-template-key",
  name: "Trading Point Manager Account",
  api: "/api/accounts/tp-mngs",
  list: "accounts/tp-mngs/list",
  create: "accounts/tp-mngs/create",
  edit: "accounts/tp-mngs/edit",
  delete: "accounts/tp-mngs/delete",
  filters: ["assigned_trade_point"],
  propertyOrder: [
    "id",
    "name",
    "username",
    "assigned_trading_point",
    "supervisor_name",
  ],
  requiredInputs: ["name", "username", "password"],
  optionalInputs: [],
  requiredChoices: ["assigned_trading_point"],
  optionalChoices: [],
};

/* **************************************************************** */

export const CONSOL_MNG_ACC_TEMPLATE = {
  key: "senior-consol-account-template-key",
  name: "Consolidation Point Manager Account",
  api: "/api/accounts/cp-mngs",
  list: "accounts/cp-mngs/list",
  create: "accounts/cp-mngs/create",
  edit: "accounts/cp-mngs/edit",
  delete: "accounts/cp-mngs/delete",
  filters: ["consol_name"],
  propertyOrder: [
    "id",
    "name",
    "username",
    "assigned_consolidation_point",
    "supervisor_name",
  ],
  requiredInputs: ["name", "username", "password"],
  optionalInputs: [],
  requiredChoices: ["assigned_consolidation_point"],
  optionalChoices: [],
};

export const SENIOR_MNG_STATS_TEMPLATE = {
  all_trades_api: "/api/trades/stats",
  one_trade_api: "/api/trades/<int:id>/stats",
  all_consols_api: "/api/consols/stats",
  one_consol_api: "/api/consols/<int:id>/stats",
};

/* ************************************************************************ */

export const TRADE_EMP_ACC_TEMPLATE = {
  api: "/api/accounts/tp-mngs/<int:mng_id>/emps",
  list: "accounts/tp-mngs/:id/tp-emps/list",
  create: "accounts/tp-mngs/:id/tp-emps/create",
  edit: "accounts/tp-mngs/:id/tp-emps/edit",
  delete: "accounts/tp-mngs/:id/tp-emps/delete",
  stats: "points/trades/:pointId/stats",
  filters: [],
  propertyOrder: [
    "id",
    "name",
    "username",
    "assigned_trading_point",
    "supervisor_name",
  ],
  requiredInputs: ["name", "username", "password"],
  optionalInputs: [],
  requiredChoices: [],
  optionalChoices: [],
};

export const TRADE_MNG_STATS_TEMPLATE = {
  stats_api: "/api/trades/<int:id>/stats",
};

/* ************************************************************************ */

export const CONSOL_EMP_ACC_TEMPLATE = {
  api: "/api/accounts/cp-mngs/<int:mng_id>/emps",
  list: "accounts/cp-mngs/:id/cp-emps/list",
  create: "accounts/cp-mngs/:id/cp-emps/create",
  edit: "accounts/cp-mngs/:id/cp-emps/edit",
  delete: "accounts/cp-mngs/:id/cp-emps/delete",
  stats: "points/consols/:pointId/stats",
  filters: [],
  propertyOrder: [
    "id",
    "name",
    "username",
    "assigned_consolidation_point",
    "supervisor_name",
  ],
  requiredInputs: ["name", "username", "password"],
  optionalInputs: [],
  requiredChoices: [],
  optionalChoices: [],
};

export const CONSOL_MNG_STATS_TEMPLATE = {
  stats_api: "/api/consols/<int:id>/stats",
};

/* ************************************************************************ */

export const SENIOR_MANAGER_SIDEBAR_TREE = [
  {
    name: "Welcome",
    icon: <FaPerson />,
    url: "/dashboard",
  },
  {
    name: "Point Management",
    icon: <FaStore />,
    nested: [
      {
        name: "Trading Point",
        icon: <FaBox />,
        nested: [
          {
            name: "List",
            icon: <MdListAlt />,
            url: TRADE_POINT_TEMPLATE.list,
          },
          {
            name: "Create",
            icon: <MdAddHomeWork />,
            url: TRADE_POINT_TEMPLATE.create,
          },
        ],
      },
      {
        name: "Consolidation Point",
        icon: <FaBoxesStacked />,
        nested: [
          {
            name: "List",
            icon: <MdListAlt />,
            url: CONSOL_POINT_TEMPLATE.list,
          },
          {
            name: "Create",
            icon: <MdAddHomeWork />,
            url: CONSOL_POINT_TEMPLATE.create,
          },
        ],
      },
    ],
  },
  {
    name: "Account Management",
    icon: <FaUsersCog />,
    nested: [
      {
        name: "Trading Point Manager",
        icon: <FaUserCog />,
        nested: [
          {
            name: "List",
            icon: <FaUsers />,
            url: TRADE_MNG_ACC_TEMPLATE.list,
          },
          {
            name: "Create",
            icon: <FaUserPlus />,
            url: TRADE_MNG_ACC_TEMPLATE.create,
          },
        ],
      },
      {
        name: "Consolidation Point Manager",
        icon: <FaUserCog />,
        nested: [
          {
            name: "List",
            icon: <FaUsers />,
            url: CONSOL_MNG_ACC_TEMPLATE.list,
          },
          {
            name: "Create",
            icon: <FaUserPlus />,
            url: CONSOL_MNG_ACC_TEMPLATE.create,
          },
        ],
      },
    ],
  },
  {
    name: "MagicPost Statistics",
    icon: <FaChartColumn />,
    url: SENIOR_MNG_STATS_URL,
  },
];

export const TRADE_MNG_SIDEBAR_TREE = [
  {
    name: "Welcome",
    icon: <FaPerson />,
    url: "/dashboard",
  },
  {
    name: "Employee Account Management",
    icon: <FaUsers />,
    nested: [
      {
        name: "List Employee Account",
        icon: <FaBox />,
        url: TRADE_EMP_ACC_TEMPLATE.list,
      },
      {
        name: "Create Employee Account",
        icon: <FaBoxesStacked />,
        url: TRADE_EMP_ACC_TEMPLATE.create,
      },
    ],
  },
  {
    name: "Trade Point Statistics",
    icon: <FaChartColumn />,
    url: TRADE_EMP_ACC_TEMPLATE.stats,
  },
];

export const CONSOL_MNG_SIDEBAR_TREE = [
  {
    name: "Welcome",
    icon: <FaPerson />,
    url: "/dashboard",
  },
  {
    name: "Employee Account Management",
    icon: <FaUsers />,
    nested: [
      {
        name: "List Employee",
        icon: <FaBox />,
        url: CONSOL_EMP_ACC_TEMPLATE.list,
      },
      {
        name: "Create New Employee",
        icon: <FaBoxesStacked />,
        url: CONSOL_EMP_ACC_TEMPLATE.create,
      },
    ],
  },
  {
    name: "Consolidation Point Statistics",
    icon: <FaChartColumn />,
    url: CONSOL_EMP_ACC_TEMPLATE.stats,
  },
];

export const TRADE_EMP_SIDEBAR_TREE = [
  {
    name: "Welcome",
    icon: <FaPerson />,
    url: "/dashboard",
  },
];

export const CONSOL_EMP_SIDEBAR_TREE = [
  {
    name: "Welcome",
    icon: <FaPerson />,
    url: "/dashboard",
  },
];

// export const TRADE_POINT_DATA = {
//   name: "Trading Point",
//   api: "/api/trades",
//   filters: ["city", "district", "ward", "consolidation_name"],
//   displayOrders: [
//     "id",
//     "trade_name",
//     "address",
//     "district",
//     "city",
//     "consolidation_name",
//     "user_name",
//   ],
//   prefixUrl: "points/trades",
//   actions: ["/", "/create", "edit", "/delete"],
//   formTemplate: [
//     { label: "trade_name", isRequired: true, type: "input", isUnique: true },
//     { label: "address", isRequired: true, type: "input", isUnique: true },
//     { label: "ward", isRequired: true, type: "input", isUnique: true },
//     { label: "district", isRequired: true, type: "input", isUnique: true },
//     { label: "city", isRequired: true, type: "input", isUnique: true },
//     {
//       label: "consolidation_name",
//       isRequired: true,
//       type: "select",
//       isMulti: false,
//     },
//     { label: "user_name", isRequired: false, type: "select", isMulti: false },
//   ],
// };

// export const CONSOL_POINT_DATA = {
//   name: "Consolidation Point",
//   api: "/api/consols",
//   filters: ["city", "district", "ward"],
//   displayOrders: [
//     "id",
//     "consolidation_name",
//     "address",
//     "district",
//     "city",
//     "trade_name_list",
//     "user_name",
//   ],
//   prefixUrl: "points/consols",
//   actions: ["/", "/create", "edit", "/delete"],
//   formTemplate: [
//     {
//       label: "consolidation_name",
//       isRequired: true,
//       type: "input",
//       isUnique: true,
//     },
//     { label: "address", isRequired: true, type: "input", isUnique: false },
//     { label: "ward", isRequired: true, type: "input", isUnique: false },
//     { label: "district", isRequired: true, type: "input", isUnique: false },
//     { label: "city", isRequired: true, type: "input", isUnique: false },
//     {
//       label: "trade_name_list",
//       isRequired: true,
//       type: "select",
//       isMulti: true,
//     },
//     { label: "user_name", isRequired: false, type: "select", isMulti: false },
//   ],
// };
