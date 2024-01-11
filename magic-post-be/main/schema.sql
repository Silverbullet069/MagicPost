
DROP TABLE IF EXISTS address;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS role;
DROP TABLE IF EXISTS consol_point;
DROP TABLE IF EXISTS trade_point;
DROP TABLE IF EXISTS customer;
DROP TABLE IF EXISTS package;
DROP TABLE IF EXISTS package_status;
DROP TRIGGER IF EXISTS remove_address_when_remove_consol_point;
DROP TRIGGER IF EXISTS remove_address_when_remove_trade_point;
DROP TRIGGER IF EXISTS remove_address_when_remove_customer;

PRAGMA foreign_keys = ON; -- very important, since it's not on by default

CREATE TABLE IF NOT EXISTS address (
  id INTEGER PRIMARY KEY,
  address TEXT NOT NULL,
  ward TEXT NOT NULL,
  district TEXT NOT NULL,
  city TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  pwdhash TEXT NOT NULL,
  role_id INTEGER NOT NULL,
  supervisor_id INTEGER NOT NULL,

  FOREIGN KEY (role_id) REFERENCES role(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (supervisor_id) REFERENCES user(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- TODO: checking if role_id of employee is equal or higher than role_id of supervisor. Maybe later.

CREATE TABLE IF NOT EXISTS role (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS consol_point (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,

  mng_id INTEGER UNIQUE, -- 1 mng for 1 CP, nullable
  address_id INTEGER UNIQUE NOT NULL,

  FOREIGN KEY (mng_id) REFERENCES user(id) ON UPDATE CASCADE ON DELETE SET NULL,
  FOREIGN KEY (address_id) REFERENCES address(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TRIGGER remove_address_when_remove_consol_point
  AFTER DELETE ON consol_point
BEGIN
  DELETE FROM address WHERE OLD.address_id = address.id;
END;

-- ! address_id and mng_id UNIQUE between consol_point and trade_point haven't implemented, reserve for future

CREATE TABLE IF NOT EXISTS trade_point (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  
  mng_id INTEGER UNIQUE, -- 1 mng_id for 1 trade point, nullable
  cp_id INTEGER NOT NULL, 
  address_id INTEGER UNIQUE NOT NULL,

  FOREIGN KEY (mng_id) REFERENCES user(id) ON UPDATE CASCADE ON DELETE SET NULL,
  FOREIGN KEY (cp_id) REFERENCES consol_point(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (address_id) REFERENCES address(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TRIGGER remove_address_when_remove_trade_point
  AFTER DELETE ON trade_point
BEGIN
  DELETE FROM address
  WHERE OLD.address_id = address.id;
END;

CREATE TABLE IF NOT EXISTS customer (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  tel TEXT NOT NULL,
  email TEXT,
  address_id INTEGER NOT NULL,
  type TEXT NOT NULL,

  CHECK (type IN ("sender", "receiver")),
  FOREIGN KEY (address_id) REFERENCES address(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TRIGGER remove_address_when_remove_customer
  AFTER DELETE ON customer
BEGIN
  DELETE FROM address
  WHERE OLD.address_id = address.id;
END;

CREATE TABLE IF NOT EXISTS package (
  id INTEGER PRIMARY KEY NOT NULL,
  tp_emp_id INTEGER NOT NULL,
  tmp_id INTEGER NOT NULL,
  customer_sender_id INTEGER NOT NULL,
  customer_receiver_id INTEGER NOT NULL,

  created_at TEXT NOT NULL,
  weight REAL NOT NULL,
  info TEXT,
  charge INTEGER NOT NULL,

  FOREIGN KEY (tp_emp_id) REFERENCES user(id) ON UPDATE CASCADE,
  FOREIGN KEY (tmp_id) REFERENCES trade_point(id) ON UPDATE CASCADE,
  FOREIGN KEY (customer_sender_id) REFERENCES customer(id) ON UPDATE CASCADE,
  FOREIGN KEY (customer_receiver_id) REFERENCES customer(id) ON UPDATE CASCADE
);

-- CREATE TABLE IF NOT EXISTS package_status (
--   id INTEGER PRIMARY KEY,
--   package_id INTEGER NOT NULL,
--   status TEXT NOT NULL,
--   timestamp TEXT NOT NULL,

--   FOREIGN KEY (package_id) REFERENCES package(id)
-- );

CREATE TABLE IF NOT EXISTS package_status (
  id INTEGER PRIMARY KEY,
  package_id INTEGER NOT NULL,

  timestamp TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,

  sender_subject TEXT NOT NULL,
  sender_id INTEGER NOT NULL,

  receiver_subject TEXT NOT NULL,
  receiver_id INTEGER NOT NULL,

  CHECK (type IN ('sent', 'received')),
  CHECK (status IN ('success', 'fail', 'pending')),
  CHECK (sender_subject IN ('sender', 'tp', 'cp')),
  CHECK (receiver_subject IN ('receiver', 'tp', 'cp')),
  FOREIGN KEY (package_id) REFERENCES package(id)
);

-- consol 1
insert into address (address, ward, district, city) values ('Số 74, ngõ 55, đường 79', 'Khương Trung', 'Thanh Xuân', 'Hà Nội');
insert into address (address, ward, district, city) values ('Số 5, ngõ 5, phố 95', 'Thanh Xuân Trung', 'Thanh Xuân', 'Hà Nội');
insert into address (address, ward, district, city) values ( 'Số 1, hẻm 1, phố 61', 'Thanh Xuân Nam', 'Thanh Xuân', 'Hà Nội');

-- other 4
insert into address (address, ward, district, city) values ('Số 4, hẻm 6, đường 67', 'Khương Mai', 'Thanh Xuân', 'Hà Nội');
insert into address (address, ward, district, city) values ('Số 6, hẻm 8, phố 2', 'Khương Trung', 'Thanh Xuân', 'Hà Nội');
insert into address (address, ward, district, city) values ('Số 57, hẻm 1, đường 61', 'Kim Giang', 'Thanh Xuân', 'Hà Nội');
insert into address (address, ward, district, city) values ('Số 65, hẻm 56, đường 9', 'Thanh Xuân Trung', 'Thanh Xuân', 'Hà Nội');
insert into address (address, ward, district, city) values ('Số 27, ngõ 2, đường 8', 'Thanh Xuân Bắc', 'Thanh Xuân', 'Hà Nội');
insert into address (address, ward, district, city) values ( 'Số 8, ngõ 75, phố 7', 'Khương Mai', 'Thanh Xuân', 'Hà Nội');


-- customers 10
-- sender
insert into address (address, ward, district, city) values ( 'Số 43, hẻm 5, đường 3', 'Khương Mai', 'Thanh Xuân', 'Hà Nội'); -- 10
insert into address (address, ward, district, city) values ( 'Số 3, hẻm 47, đường 9', 'Kim Giang', 'Thanh Xuân', 'Hà Nội'); -- 11
insert into address (address, ward, district, city) values ( 'Số 1, hẻm 35, phố 69', 'Thanh Xuân Trung', 'Thanh Xuân', 'Hà Nội'); -- 12

-- receiver
insert into address (address, ward, district, city) values ('Số 64, ngõ 5, phố 3', 'Thanh Xuân Bắc', 'Thanh Xuân', 'Hà Nội'); -- 13
insert into address (address, ward, district, city) values ('Số 6, ngõ 9, phố 54', 'Hạ Đình', 'Thanh Xuân', 'Hà Nội'); -- 14
insert into address (address, ward, district, city) values ( 'Số 34, ngõ 8, phố 95', 'Thượng Đình', 'Thanh Xuân', 'Hà Nội'); -- 15

-- others 16
insert into address (address, ward, district, city) values ( 'Số 4, hẻm 6, đường 52', 'Hạ Đình', 'Thanh Xuân', 'Hà Nội');
insert into address (address, ward, district, city) values ( 'Số 9, hẻm 50, đường 3', 'Thượng Đình', 'Thanh Xuân', 'Hà Nội');
insert into address (address, ward, district, city) values ( 'Số 7, hẻm 8, phố 9', 'Thượng Đình', 'Thanh Xuân', 'Hà Nội');

insert into address (address, ward, district, city) values ( 'Số 63, hẻm 55, đường 52', 'Khương Mai', 'Thanh Xuân', 'Hà Nội');
insert into address (address, ward, district, city) values ( 'Số 91, hẻm 23, phố 57', 'Khương Đình', 'Thanh Xuân', 'Hà Nội');

INSERT INTO role (name) VALUES ('senior_mng'); -- 1
INSERT INTO role (name) VALUES ('tp_mng'); -- 2
INSERT INTO role (name) VALUES ('cp_mng'); -- 3
INSERT INTO role (name) VALUES ('tp_emp'); -- 4
INSERT INTO role (name) VALUES ('cp_emp'); -- 5

-- Password: 123456

-- Senior Manager
INSERT INTO user (username, pwdhash, name, role_id, supervisor_id) VALUES ('senior_mng', 'scrypt:32768:8:1$A9QlIkxohz04DSwQ$d2cf0d038409d33357e1c61b5bf949f450d8a987b5c6cf81c6a0e91c25bf14096eb8a0a79f7d8b9049dc141f1b6dce84a023bed21226bb52522851f5d6b25543', 'V.H', 1, 1); -- 1, self-supervise (a workaround)

-- Trade Point Managers -- 2 - 3 - 4 - 5 - 6
INSERT INTO user (username, pwdhash, name, role_id, supervisor_id) VALUES ('tp_mng_01', 'scrypt:32768:8:1$5yFgMSmlmENhb4CW$25cbb78a169aa311079372ac60c4a98fa54386316b94d09053cd976c51d08395115503d2b80cb9148dd4abc67bca2537ed8015fea417fc1247f757e06300c5e1', 'John Doe #1', 2, 1); -- 2

INSERT INTO user (username, pwdhash, name, role_id, supervisor_id) VALUES ('tp_mng_02', 'scrypt:32768:8:1$5yFgMSmlmENhb4CW$25cbb78a169aa311079372ac60c4a98fa54386316b94d09053cd976c51d08395115503d2b80cb9148dd4abc67bca2537ed8015fea417fc1247f757e06300c5e1', 'John Doe #2', 2, 1); -- 3

INSERT INTO user (username, pwdhash, name, role_id, supervisor_id) VALUES ('tp_mng_03', 'scrypt:32768:8:1$5yFgMSmlmENhb4CW$25cbb78a169aa311079372ac60c4a98fa54386316b94d09053cd976c51d08395115503d2b80cb9148dd4abc67bca2537ed8015fea417fc1247f757e06300c5e1', 'John Doe #3', 2, 1); -- 4

INSERT INTO user (username, pwdhash, name, role_id, supervisor_id) VALUES ('tp_mng_04', 'scrypt:32768:8:1$5yFgMSmlmENhb4CW$25cbb78a169aa311079372ac60c4a98fa54386316b94d09053cd976c51d08395115503d2b80cb9148dd4abc67bca2537ed8015fea417fc1247f757e06300c5e1', 'John Doe #4', 2, 1); -- 5

INSERT INTO user (username, pwdhash, name, role_id, supervisor_id) VALUES ('tp_mng_05', 'scrypt:32768:8:1$5yFgMSmlmENhb4CW$25cbb78a169aa311079372ac60c4a98fa54386316b94d09053cd976c51d08395115503d2b80cb9148dd4abc67bca2537ed8015fea417fc1247f757e06300c5e1', 'John Doe #5', 2, 1); -- 6

-- Consol Point Managers - 7 - 8 - 9

INSERT INTO user (username, pwdhash, name, role_id, supervisor_id) VALUES ('cp_mng_01', 'scrypt:32768:8:1$Tc8xFARYyraChEdT$7759adf4035dea21a77a48fdb227610b35146ce65e3753081e000b1d58a9136d09e26854d4e9943b8a7fad3a5946d41c53903ec13333f517f1cb8a92a907da25', 'Jane Doe #1', 3, 1); -- 7

INSERT INTO user (username, pwdhash, name, role_id, supervisor_id) VALUES ('cp_mng_02', 'scrypt:32768:8:1$Tc8xFARYyraChEdT$7759adf4035dea21a77a48fdb227610b35146ce65e3753081e000b1d58a9136d09e26854d4e9943b8a7fad3a5946d41c53903ec13333f517f1cb8a92a907da25', 'Jane Doe #1', 3, 1); -- 8

-- Trade Points Employee 

INSERT INTO user (username, pwdhash, name, role_id, supervisor_id) VALUES ('tp_emp_01', 'scrypt:32768:8:1$DwpGT1UD12Vn85NV$c10e829a9fdf5d8995423011a896b85028f74eea1b0b4cf13c25b6d75cadee3e1a11ad378aa3f7352dfd7a438b44531a914c0e54df41b7fe17d713c4769f5599', 'Junior John Doe #1', 4, 2); -- 9

INSERT INTO user (username, pwdhash, name, role_id, supervisor_id) VALUES ('tp_emp_02', 'scrypt:32768:8:1$DwpGT1UD12Vn85NV$c10e829a9fdf5d8995423011a896b85028f74eea1b0b4cf13c25b6d75cadee3e1a11ad378aa3f7352dfd7a438b44531a914c0e54df41b7fe17d713c4769f5599', 'Junior John Doe #2', 4, 2); -- 10

INSERT INTO user (username, pwdhash, name, role_id, supervisor_id) VALUES ('tp_emp_03', 'scrypt:32768:8:1$DwpGT1UD12Vn85NV$c10e829a9fdf5d8995423011a896b85028f74eea1b0b4cf13c25b6d75cadee3e1a11ad378aa3f7352dfd7a438b44531a914c0e54df41b7fe17d713c4769f5599', 'Junior John Doe #3', 4, 3); -- 11

INSERT INTO user (username, pwdhash, name, role_id, supervisor_id) VALUES ('tp_emp_04', 'scrypt:32768:8:1$DwpGT1UD12Vn85NV$c10e829a9fdf5d8995423011a896b85028f74eea1b0b4cf13c25b6d75cadee3e1a11ad378aa3f7352dfd7a438b44531a914c0e54df41b7fe17d713c4769f5599', 'Junior John Doe #4', 4, 4); -- 12

INSERT INTO user (username, pwdhash, name, role_id, supervisor_id) VALUES ('tp_emp_05', 'scrypt:32768:8:1$DwpGT1UD12Vn85NV$c10e829a9fdf5d8995423011a896b85028f74eea1b0b4cf13c25b6d75cadee3e1a11ad378aa3f7352dfd7a438b44531a914c0e54df41b7fe17d713c4769f5599', 'Junior John Doe #5', 4, 5); -- 13

-- Consol Points Employee 

INSERT INTO user (username, pwdhash, name, role_id, supervisor_id) VALUES ('cp_emp_01', 'scrypt:32768:8:1$xslJGOvPuPa7kAn7$8b9c448de9e892653db5b2c63f11c2e3f12171379a12113e25b7933f613ccb92e30c222226c7c8971f00620d42e06a119b7a0d0561b850e0e036f257c07229cb', 'Junior Jane Doe #1', 5, 7); -- 14

INSERT INTO user (username, pwdhash, name, role_id, supervisor_id) VALUES ('cp_emp_02', 'scrypt:32768:8:1$xslJGOvPuPa7kAn7$8b9c448de9e892653db5b2c63f11c2e3f12171379a12113e25b7933f613ccb92e30c222226c7c8971f00620d42e06a119b7a0d0561b850e0e036f257c07229cb', 'Junior John Doe #2', 5, 7); -- 15

INSERT INTO user (username, pwdhash, name, role_id, supervisor_id) VALUES ('cp_emp_03', 'scrypt:32768:8:1$xslJGOvPuPa7kAn7$8b9c448de9e892653db5b2c63f11c2e3f12171379a12113e25b7933f613ccb92e30c222226c7c8971f00620d42e06a119b7a0d0561b850e0e036f257c07229cb', 'Junior John Doe #3', 5, 8); -- 16

INSERT INTO user (username, pwdhash, name, role_id, supervisor_id) VALUES ('cp_emp_04', 'scrypt:32768:8:1$xslJGOvPuPa7kAn7$8b9c448de9e892653db5b2c63f11c2e3f12171379a12113e25b7933f613ccb92e30c222226c7c8971f00620d42e06a119b7a0d0561b850e0e036f257c07229cb', 'Junior John Doe #4', 5, 8); -- 17

-- Consolidation points

INSERT INTO consol_point(name, mng_id, address_id)
VALUES ('MagicPost Consolidation Point Thanh Xuan #1', 7, 1); -- Khuong Trung

INSERT INTO consol_point(name, mng_id, address_id)
VALUES ('MagicPost Consolidation Point Thanh Xuan #2', 8, 2); -- TX Trung

INSERT INTO consol_point(name, address_id) 
VALUES ('MagicPost Consolidation Point Thanh Xuan #3', 3); -- TX Nam, -- ! no mng_id

-- Trading points
-- Khuong Mai, Khuong Trung, Kim Giang => Khuong Trung
INSERT INTO trade_point (name, mng_id, cp_id, address_id) 
VALUES ('MagicPost Trading Point Khuong Mai #1', 2, 1, 4);

INSERT INTO trade_point (name, mng_id, cp_id, address_id) 
VALUES ('MagicPost Trading Point Khuong Trung #1', 3, 1, 5);

INSERT INTO trade_point (name, mng_id, cp_id, address_id)
VALUES ('MagicPost Trading Point Kim Giang #1', 4, 1, 6);

-- TX Trung, TX Bac => TX Trung
INSERT INTO trade_point (name, mng_id, cp_id, address_id) 
VALUES ('MagicPost Trading Point TX Trung #1', 5, 2, 7);

INSERT INTO trade_point (name, mng_id, cp_id, address_id) 
VALUES ('MagicPost Trading Point TX Bac #1', 6, 2, 8);

INSERT INTO trade_point (name, cp_id, address_id) -- ! no mng_id
VALUES ('MagicPost Trading Point Khuong Mai #2', 3, 9); 

-- Customers

INSERT INTO customer (name, tel, email, address_id, type)
VALUES ('Nguyen Van A', '0123456789', 'nguyenvana@gmail.com', 10, 'sender');

INSERT INTO customer (name, tel, email, address_id, type)
VALUES ('Tran Thi B', '0124548143', 'tranthib@gmail.com', 11, 'sender');

INSERT INTO customer (name, tel, email, address_id, type)
VALUES ('Ly Van C', '0987654321', 'lyvanc@gmail.com', 12,  'sender');

INSERT INTO customer (name, tel, email, address_id, type)
VALUES ('Ho Quoc D', '0455134861', 'hoquocd@gmail.com', 13, 'receiver');

INSERT INTO customer (name, tel, email, address_id, type)
VALUES ('Ma Van E', '0748183946', 'mavane@gmail.com', 14, 'receiver');

INSERT INTO customer (name, tel, email, address_id, type)
VALUES ('Nguyen Thi G', '0484957843', 'nguyenthig@gmail.com', 15, 'receiver');

-- Mock scenario: Nguyen Van A => Ho Quoc D
-- Assume generated by MagicPost

-- Trade Point ID -- 1 MagicPost Trading Point Khuong Mai #1
-- Trade Point Manager -- 2 
-- Trade Point Employee ID -- (9 or 10) 
-- Sender ID -- 1 'Nguyen Van A'
-- Sender Address ID -- 10 'Khuong Mai'
-- Receiver ID -- 4 'Ho Quoc D'
-- Reseiver Address ID -- 13 'TX Bac'

-- Khuong Mai => TX Bac

-- Trade Point Khuong Mai #1 -- Khuong Mai
-- Consolidation Point Thanh Xuan #1 ID -- 1 -- Khuong Trung
-- Consolidation Point Thanh Xuan #2 ID -- 2 -- TX Trung
-- Consolidation Point Thanh Xuan #3 ID -- 3 -- TX Nam
-- Trade Point TX Bac #1 -- TX Bac -- 5 

-- 'Khuong Mai' => 'TX Trung #1'

INSERT INTO package (tp_emp_id, tmp_id, customer_sender_id, customer_receiver_id, created_at, info, weight, charge)
VALUES (9, 1, 1, 4, '2024-01-07 12:14:34', 'This is a mock package', '0.5', '100000');

INSERT INTO package_status (package_id, timestamp, type, status, sender_subject, sender_id, receiver_subject, receiver_id)
VALUES 
(1, '2024-01-08 12:14:33', 'received', 'success', 'sender', 1, 'tp', 1),
(1, '2024-01-08 14:54:46', 'sent', 'pending', 'tp', 1, 'cp', 1),
(1, '2024-01-09 08:07:14', 'sent', 'success', 'tp', 1, 'cp', 1), -- This
(1, '2024-01-09 08:07:15', 'received', 'pending', 'tp', 1, 'cp', 1),
(1, '2024-01-09 17:34:12', 'received', 'success', 'tp', 1, 'cp', 1),
(1, '2024-01-09 17:34:12', 'sent', 'pending', 'cp', 1, 'cp', 2),
(1, '2024-01-10 09:48:57', 'sent', 'success', 'cp', 1, 'cp', 2),
(1, '2024-01-10 09:48:58', 'received', 'pending', 'cp', 1, 'cp', 2),
(1, '2024-01-10 13:25:42', 'received', 'success', 'cp', 1, 'cp', 2),
(1, '2024-01-10 13:25:43', 'sent', 'pending', 'cp', 2, 'cp', 3),
(1, '2024-01-11 07:59:02', 'sent', 'success', 'cp', 2, 'cp', 3),
(1, '2024-01-11 07:59:03', 'received', 'pending', 'cp', 2, 'cp', 3),
(1, '2024-01-11 10:57:19', 'received', 'success', 'cp', 2, 'cp', 3),
(1, '2024-01-10 10:57:20', 'sent', 'pending', 'cp', 3, 'tp', 5),
(1, '2024-01-11 11:34:57', 'sent', 'success', 'cp', 3, 'tp', 5),
(1, '2024-01-11 11:34:58', 'received', 'pending', 'cp', 3, 'tp', 5),
(1, '2024-01-11 14:01:21', 'received', 'success', 'cp', 3, 'tp', 5),
(1, '2024-01-11 14:01:22', 'sent', 'pending', 'tp', 5, 'receiver', 4),
(1, '2024-01-11 14:37:08', 'sent', 'success', 'tp', 5, 'receiver', 4), -- Or this
(1, '2024-01-11 14:01:22', 'received', 'pending', 'tp', 5, 'receiver', 4),
(1, '2024-01-11 16:59:29', 'received', 'success', 'tp', 5, 'receiver', 4);

