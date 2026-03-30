-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 30-03-2026 a las 21:03:55
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `security_hub`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_logs`
--

CREATE TABLE `password_logs` (
  `id` int(11) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_evento_calendario` date DEFAULT NULL,
  `nivel_seguridad` varchar(20) DEFAULT 'débil',
  `longitud` int(11) DEFAULT 0,
  `tiene_mayusculas` tinyint(1) DEFAULT 0,
  `tiene_numeros` tinyint(1) DEFAULT 0,
  `tiene_especiales` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `password_logs`
--

INSERT INTO `password_logs` (`id`, `password_hash`, `fecha_creacion`, `fecha_evento_calendario`, `nivel_seguridad`, `longitud`, `tiene_mayusculas`, `tiene_numeros`, `tiene_especiales`) VALUES
(1, '531647a0776ccd779c5333f0945e6cccaf8c9f4cd1c85bf755a1bbe444ae9866', '2026-03-30 04:03:26', '2026-03-15', 'fuerte', 12, 1, 1, 1),
(2, 'e1f9bece32ddf8071b8565af942fe1ba362691869a2b4a54b0eb9136b4e413c4', '2026-03-30 04:03:26', '2026-03-20', 'medio', 9, 1, 0, 1),
(3, 'fb774e170de861711d0e425d74a21be200ebbd5e20c681e280d7da7829851775', '2026-03-30 04:03:26', '2026-03-25', 'débil', 6, 0, 1, 0),
(4, '$2y$12$V.F1zo42BTuIoI9AcnGRaekv1C1OgIvAmnrhUeKGNWcQw.r26Uk7.', '2026-03-30 04:38:51', NULL, 'Muy Fuerte', 23, 1, 1, 1),
(5, '$2y$12$lhGzbNyIJbMB9B6FimvZK.xZ7LokJ5hjQfaxlLQ7sp794QvptAfcO', '2026-03-30 18:52:30', NULL, 'Muy Fuerte', 28, 1, 1, 1),
(6, '$2y$12$uqBakvcBdGIhc885QzRGiudgwYnETVzJECiIsuic6UlMp3eD9SkqS', '2026-03-30 18:56:31', '2026-03-30', 'Muy Fuerte', 21, 1, 1, 1),
(7, '$2y$12$iDF8bRZnwoSVAfFMQ1fIOeK1tAYtKDC63UfSn0SJZyK0O4MV/EwHC', '2026-03-30 18:58:43', NULL, 'Muy Fuerte', 13, 1, 1, 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `password_logs`
--
ALTER TABLE `password_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_fecha_creacion` (`fecha_creacion`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `password_logs`
--
ALTER TABLE `password_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
