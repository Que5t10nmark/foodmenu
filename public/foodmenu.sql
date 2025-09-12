-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 12, 2025 at 08:48 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `foodmenu`
--

-- --------------------------------------------------------

--
-- Table structure for table `account`
--

CREATE TABLE `account` (
  `account_id` int(11) NOT NULL,
  `account_name` varchar(255) NOT NULL,
  `account_username` varchar(255) NOT NULL,
  `account_password` varchar(255) NOT NULL,
  `account_phone` varchar(15) NOT NULL,
  `account_address` text NOT NULL,
  `account_role` enum('เจ้าของร้าน','ห้องครัว') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `account`
--

INSERT INTO `account` (`account_id`, `account_name`, `account_username`, `account_password`, `account_phone`, `account_address`, `account_role`, `created_at`) VALUES
(1, 'mark', 'Imark', '$2b$10$Iko.kHJYUZDtRMZPKOLaE.mTFcyD1zbIi8U1wkZ7KCKOa30kq8jLm', '0987654321', 'BRU', 'เจ้าของร้าน', '2025-05-07 16:26:32');

-- --------------------------------------------------------

--
-- Table structure for table `kitchen_order`
--

CREATE TABLE `kitchen_order` (
  `kitchen_order_id` int(10) NOT NULL,
  `product_id` int(11) NOT NULL,
  `total_quantity` int(11) NOT NULL,
  `order_status` varchar(10) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kitchen_order_detail`
--

CREATE TABLE `kitchen_order_detail` (
  `kitchen_order_detail_id` int(10) NOT NULL,
  `kitchen_order_id` int(11) NOT NULL,
  `purchase_detail_id` int(11) NOT NULL,
  `seat_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `product_id` int(10) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `product_type` varchar(100) NOT NULL,
  `product_price` int(11) NOT NULL,
  `product_size` varchar(20) NOT NULL,
  `product_image` varchar(250) NOT NULL,
  `product_description` varchar(250) NOT NULL,
  `product_status` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`product_id`, `product_name`, `product_type`, `product_price`, `product_size`, `product_image`, `product_description`, `product_status`) VALUES
(1, 'สเต็กไก่', '3', 100, 'M', '1745820430813.jpg', 'description', '1'),
(2, 'สเต๊กทาร์ทาร์หมูดำ', '3', 99, 'M', '1745820653832.jpg', 'description', '0'),
(3, 'สเต๊กหมูพริกไทยดำ', '3', 159, 'S', '1745820731503.jpg', 'description', '1'),
(4, 'พอร์คชอปกับสลัดส้ม', '1', 100, 'S', '1745820760008.jpg', 'description', '0'),
(5, 'พอร์คชอปเปรี้ยวหวาน', '1', 100, 'L', '1745820791519.jpg', 'description', '0'),
(6, 'สเต๊กหมูซอสเห็ดหอม', '3', 100, 'L', '1745820828033.jpg', 'description', '1'),
(7, 'สเต๊กไก่สับ', '3', 100, 'S', '1745820891420.jpg', 'description', '1'),
(8, 'สเต๊กไก่ย่างพริกไทยดำ', '3', 100, 'S', '1745820925786.jpg', 'description', '1'),
(9, 'โค้ก', '2', 20, '-', '1745821075757.jpg', 'description', '1'),
(10, 'น้ำเปล่า', '2', 20, '-', '1745821121051.webp', 'description', '1'),
(11, 'ชาไทย', '2', 20, '-', '1745825475464.jpg', 'description', '1');

-- --------------------------------------------------------

--
-- Table structure for table `product_option`
--

CREATE TABLE `product_option` (
  `option_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `option_type` enum('size','spice','topping','note') NOT NULL,
  `option_value` varchar(100) DEFAULT NULL,
  `extra_price` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_type`
--

CREATE TABLE `product_type` (
  `product_type_id` int(10) NOT NULL,
  `product_type_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `product_type`
--

INSERT INTO `product_type` (`product_type_id`, `product_type_name`) VALUES
(1, 'ของทอด'),
(3, 'สเต็ก'),
(2, 'เครื่องดื่ม');

-- --------------------------------------------------------

--
-- Table structure for table `purchase`
--

CREATE TABLE `purchase` (
  `purchase_id` int(10) NOT NULL,
  `seat_id` int(10) NOT NULL,
  `purchase_date` datetime NOT NULL,
  `purchase_total_amount` int(11) NOT NULL,
  `purchase_status` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_detail`
--

CREATE TABLE `purchase_detail` (
  `purchase_detail_id` int(10) NOT NULL,
  `purchase_id` int(10) NOT NULL,
  `product_id` int(20) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `product_price` int(11) NOT NULL,
  `product_quantity` int(11) NOT NULL,
  `product_total_price` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `seat`
--

CREATE TABLE `seat` (
  `seat_id` int(10) NOT NULL,
  `seat_qrcode` varchar(250) NOT NULL,
  `seat_status` varchar(100) NOT NULL,
  `seat_zone` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `seat`
--

INSERT INTO `seat` (`seat_id`, `seat_qrcode`, `seat_status`, `seat_zone`) VALUES
(1, '1', 'ว่าง', 'A'),
(2, '2', 'ไม่ว่าง', 'B'),
(3, '3', 'ว่าง', 'C'),
(5, '4', 'ว่าง', 'D'),
(6, '5', 'ว่าง', 'E');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account`
--
ALTER TABLE `account`
  ADD PRIMARY KEY (`account_id`),
  ADD UNIQUE KEY `account_username` (`account_username`);

--
-- Indexes for table `kitchen_order`
--
ALTER TABLE `kitchen_order`
  ADD PRIMARY KEY (`kitchen_order_id`);

--
-- Indexes for table `kitchen_order_detail`
--
ALTER TABLE `kitchen_order_detail`
  ADD PRIMARY KEY (`kitchen_order_detail_id`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`product_id`);

--
-- Indexes for table `product_option`
--
ALTER TABLE `product_option`
  ADD PRIMARY KEY (`option_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `product_type`
--
ALTER TABLE `product_type`
  ADD PRIMARY KEY (`product_type_id`),
  ADD UNIQUE KEY `product_type_name` (`product_type_name`) USING BTREE;

--
-- Indexes for table `purchase`
--
ALTER TABLE `purchase`
  ADD PRIMARY KEY (`purchase_id`);

--
-- Indexes for table `purchase_detail`
--
ALTER TABLE `purchase_detail`
  ADD PRIMARY KEY (`purchase_detail_id`);

--
-- Indexes for table `seat`
--
ALTER TABLE `seat`
  ADD PRIMARY KEY (`seat_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `account`
--
ALTER TABLE `account`
  MODIFY `account_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `product_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `product_option`
--
ALTER TABLE `product_option`
  MODIFY `option_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_type`
--
ALTER TABLE `product_type`
  MODIFY `product_type_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `purchase`
--
ALTER TABLE `purchase`
  MODIFY `purchase_id` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase_detail`
--
ALTER TABLE `purchase_detail`
  MODIFY `purchase_detail_id` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `seat`
--
ALTER TABLE `seat`
  MODIFY `seat_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `product_option`
--
ALTER TABLE `product_option`
  ADD CONSTRAINT `product_option_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
