<?php
/**
 * Security Hub - Guardar Contraseña
 * 
 * Endpoint para recibir, validar y guardar contraseñas en la base de datos
 */

require_once 'config.php';

// Manejar solicitud OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    setJSONHeaders();
    exit(0);
}

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Método no permitido. Use POST', 405);
}

try {
    // Obtener y validar entrada JSON
    $input = getJSONInput();
    
    // Validar campos requeridos
    if (!isset($input['password']) || empty($input['password'])) {
        sendError('El campo contraseña es requerido');
    }
    
    $password = $input['password'];
    $nivelSeguridad = $input['nivel_seguridad'] ?? 'débil';
    $longitud = $input['longitud'] ?? strlen($password);
    $tieneMayusculas = $input['tiene_mayusculas'] ?? false;
    $tieneNumeros = $input['tiene_numeros'] ?? false;
    $tieneEspeciales = $input['tiene_especiales'] ?? false;
    $fechaEvento = $input['fecha_evento_calendario'] ?? null;
    
    // Re-validar contraseña en el servidor (nunca confiar solo en el frontend)
    $validation = validatePassword($password);
    
    if (!$validation['valid']) {
        sendError('Contraseña no válida: ' . implode(', ', $validation['errors']));
    }
    
    // Hashear la contraseña (NUNCA guardar contraseñas en texto plano)
    $passwordHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    
    // Obtener conexión a la base de datos
    $db = getDB();
    
    // Preparar consulta
    $sql = "INSERT INTO password_logs 
            (password_hash, nivel_seguridad, longitud, tiene_mayusculas, tiene_numeros, tiene_especiales, fecha_evento_calendario) 
            VALUES 
            (:hash, :nivel, :longitud, :mayusculas, :numeros, :especiales, :fecha_evento)";
    
    $stmt = $db->prepare($sql);
    
    // Ejecutar consulta con parámetros
    $result = $stmt->execute([
        ':hash' => $passwordHash,
        ':nivel' => sanitizeInput($nivelSeguridad),
        ':longitud' => (int)$longitud,
        ':mayusculas' => (bool)$tieneMayusculas,
        ':numeros' => (bool)$tieneNumeros,
        ':especiales' => (bool)$tieneEspeciales,
        ':fecha_evento' => $fechaEvento
    ]);
    
    if ($result) {
        $insertId = $db->lastInsertId();
        
        // Registrar actividad
        logActivity('PASSWORD_SAVED', "ID: $insertId, Nivel: $nivelSeguridad");
        
        // Enviar respuesta exitosa
        sendJSON([
            'success' => true,
            'message' => 'Contraseña guardada exitosamente',
            'data' => [
                'id' => $insertId,
                'nivel_seguridad' => $nivelSeguridad,
                'fecha_creacion' => date('Y-m-d H:i:s')
            ]
        ], 201);
    } else {
        throw new Exception('Error al insertar en la base de datos');
    }
    
} catch (PDOException $e) {
    error_log("Error de base de datos en save_password.php: " . $e->getMessage());
    sendError('Error al guardar en la base de datos', 500);
    
} catch (Exception $e) {
    error_log("Error en save_password.php: " . $e->getMessage());
    sendError($e->getMessage(), 500);
}
?>
