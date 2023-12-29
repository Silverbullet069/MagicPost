
DROP TABLE IF EXISTS trading_points;
DROP TABLE IF EXISTS consolidation_points;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS packages;
DROP TABLE IF EXISTS package_status;

CREATE TABLE IF NOT EXISTS trade_points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
)

-- 1-n relationship
CREATE TABLE IF NOT EXISTS consol_points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tp_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,

  FOREIGN KEY (tp_id) REFERENCES trade_points(id)
)

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  pwdhash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,

  CHECK (role IN ("senior_mng", "trade_mng", "consol_mng", "trade_emp", "consol_emp"))
)

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  tel TEXT NOT NULL,
  zip_code TEXT NOT NULL
)

CREATE TABLE IF NOT EXISTS packages (
  id TEXT PRIMARY KEY NOT NULL,

  consol_emp_id INTEGER NOT NULL,
  FOREIGN KEY (consol_emp_id) REFERENCES users(id),

  consol_id INTEGER NOT NULL,
  FOREIGN KEY (consol_id) REFERENCES consol_points(id),

  sender_id INTEGER NOT NULL,
  FOREIGN KEY (sender_id) REFERENCES customer(id),

  receiver_id INTEGER NOT NULL,
  FOREIGN KEY (receiver_id) REFERENCES customer(id),

  package_info TEXT,
  send_date TEXT NOT NULL,
  weight REAL NOT NULL,

  freight_main_charge INTEGER NOT NULL,
  freight_extra_charge INTEGER NOT NULL,
  freight_tax_charge INTEGER NOT NULL,
  freight_total_charge INTEGER NOT NULL,

  cod_charge INTEGER NOT NULL,
  cod_extra_charge INTEGER NOT NULL,
  cod_total_charge INTEGER NOT NULL,
)

CREATE TABLE IF NOT EXISTS package_status (
  id INTEGER PRIMARY AUTOINCREMENT,
  package_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  timestamp TEXT NOT NULL,

  FOREIGN KEY (package_id) REFERENCES package(id)
)

