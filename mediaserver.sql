-- --------------------------------------------------------
-- Verkkotietokone:              192.168.1.123
-- Palvelinversio:               10.6.18-MariaDB-0ubuntu0.22.04.1 - Ubuntu 22.04
-- Server OS:                    debian-linux-gnu
-- HeidiSQL Versio:              12.6.0.6765
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for mediaserver
CREATE DATABASE IF NOT EXISTS `mediaserver` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `mediaserver`;

-- Dumping structure for taulu mediaserver.media
CREATE TABLE IF NOT EXISTS `media` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `file_path` varchar(255) NOT NULL,
  `metadata` text DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table mediaserver.media: ~0 rows (suunnilleen)

-- Dumping structure for taulu mediaserver.react_php
CREATE TABLE IF NOT EXISTS `react_php` (
  `id` int(11) DEFAULT NULL,
  `x` varchar(50) DEFAULT NULL,
  `texts` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table mediaserver.react_php: ~5 rows (suunnilleen)
INSERT INTO `react_php` (`id`, `x`, `texts`) VALUES
	(NULL, NULL, 'x'),
	(NULL, NULL, 'x'),
	(NULL, NULL, 'x'),
	(NULL, NULL, 'x'),
	(NULL, NULL, 'x');

-- Dumping structure for taulu mediaserver.tasks
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_by` varchar(50) NOT NULL DEFAULT '',
  `assigned_to` varchar(50) DEFAULT NULL,
  `media_id` varchar(50) DEFAULT NULL,
  `status` enum('Pending','In Progress','OK','Fail') DEFAULT 'Pending',
  `annotations` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `title` varchar(50) DEFAULT NULL,
  `description` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `assigned_to` (`assigned_to`),
  KEY `media_id` (`media_id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table mediaserver.tasks: ~4 rows (suunnilleen)
INSERT INTO `tasks` (`id`, `created_by`, `assigned_to`, `media_id`, `status`, `annotations`, `created_at`, `updated_at`, `title`, `description`) VALUES
	(6, 'tyhjyys', 'expert1', '674817777d8a1ba2b40a8ffc', 'Pending', NULL, '2024-11-28 07:10:46', '2024-11-28 07:11:07', 'TITLE', 'DESCRIBTION'),
	(7, 'tyhjyys', 'expert1', '674817777d8a1ba2b40a8ffe', 'OK', 'elä laita tämmöstä meille ', '2024-11-28 07:10:47', '2024-11-28 10:18:57', 'TITLE', 'DESCRIBTION'),
	(8, 'tyhjyys', 'expert1', '674817777d8a1ba2b40a9000', 'Pending', NULL, '2024-11-28 07:10:47', '2024-11-28 07:11:10', 'TITLE', 'DESCRIBTION'),
	(38, 'expert1', 'tyh', '674821507d8a1ba2b40a903b', 'Pending', NULL, '2024-11-28 07:52:48', '2024-11-28 10:19:47', 'a', 'a');

-- Dumping structure for taulu mediaserver.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `role` enum('user','expert','sysadmin') NOT NULL DEFAULT 'user',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table mediaserver.users: ~6 rows (suunnilleen)
INSERT INTO `users` (`id`, `username`, `password`, `created_at`, `role`) VALUES
	(11, 'tyhjyys', '2e60148f4265f237b1a5bff4b8985c595564c54dd1828e9458d48267bb997915', '2024-11-27 13:51:28', 'sysadmin'),
	(12, 'expert1', '22fa5b8fd33e146c149fbbb0a71539926f2f8c9bdad93a3fdc8ffa42f0baa15b', '2024-11-27 14:18:13', 'expert'),
	(13, 'tyh', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '2024-11-27 16:18:01', 'expert'),
	(14, 'oh3cyt', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '2024-11-27 17:16:38', 'sysadmin'),
	(85, 'oh3cyt2', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '2024-11-27 17:20:29', 'expert'),
	(87, 's', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '2024-11-28 07:23:38', 'user');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
