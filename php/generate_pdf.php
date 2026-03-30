<?php
/**
 * Security Hub - Generador de Reportes PDF
 * 
 * Este script genera un reporte completo en PDF con:
 * - Fecha y hora actual
 * - Estado del calendario
 * - Última contraseña analizada
 * - Últimos 5 registros de contraseñas
 * 
 * Nota: Este script usa FPDF. Asegúrate de tener la librería en la carpeta fpdf/
 * Descarga FPDF desde: http://www.fpdf.org/
 */

require_once 'config.php';

// Verificar si existe FPDF
$fpdfPath = __DIR__ . '/../fpdf/fpdf.php';

if (!file_exists($fpdfPath)) {
    // Si no existe FPDF, crear un PDF simple con contenido básico
    generateSimplePDF();
    exit;
}

require_once $fpdfPath;

// Manejar solicitud OPTIONS (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    setJSONHeaders();
    exit(0);
}

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Método no permitido. Use POST', 405);
}

try {
    // Obtener datos del reporte
    $input = getJSONInput();
    
    $calendarInfo = $input['calendar'] ?? null;
    $passwordInfo = $input['password'] ?? null;
    
    // Crear instancia de FPDF
    $pdf = new FPDF('P', 'mm', 'A4');
    $pdf->SetMargins(20, 20, 20);
    $pdf->AddPage();
    
    // ENCABEZADO
    $pdf->SetFont('Arial', 'B', 24);
    $pdf->SetTextColor(103, 126, 234);
    $pdf->Cell(0, 15, 'Security Hub', 0, 1, 'C');
    
    $pdf->SetFont('Arial', '', 12);
    $pdf->SetTextColor(100, 100, 100);
    $pdf->Cell(0, 8, 'Reporte Mensual de Seguridad y Productividad', 0, 1, 'C');
    
    // Línea separadora
    $pdf->SetDrawColor(103, 126, 234);
    $pdf->SetLineWidth(0.5);
    $pdf->Line(20, $pdf->GetY() + 2, 190, $pdf->GetY() + 2);
    $pdf->Ln(10);
    
    // INFORMACIÓN GENERAL
    $pdf->SetFont('Arial', 'B', 14);
    $pdf->SetTextColor(0, 0, 0);
    $pdf->Cell(0, 10, 'Informacion General', 0, 1);
    
    $pdf->SetFont('Arial', '', 11);
    $pdf->SetTextColor(60, 60, 60);
    
    $fechaActual = date('d/m/Y H:i:s');
    $pdf->Cell(50, 7, 'Fecha de generacion:', 0, 0);
    $pdf->SetFont('Arial', 'B', 11);
    $pdf->Cell(0, 7, $fechaActual, 0, 1);
    
    $pdf->SetFont('Arial', '', 11);
    $pdf->Cell(50, 7, 'Usuario:', 0, 0);
    $pdf->SetFont('Arial', 'B', 11);
    $pdf->Cell(0, 7, 'Administrador', 0, 1);
    
    $pdf->Ln(5);
    
    // ESTADO DEL CALENDARIO
    $pdf->SetFont('Arial', 'B', 14);
    $pdf->SetTextColor(0, 0, 0);
    $pdf->Cell(0, 10, 'Estado del Calendario', 0, 1);
    
    $pdf->SetFont('Arial', '', 11);
    $pdf->SetTextColor(60, 60, 60);
    
    if ($calendarInfo) {
        $pdf->Cell(50, 7, 'Mes visualizado:', 0, 0);
        $pdf->SetFont('Arial', 'B', 11);
        $pdf->Cell(0, 7, $calendarInfo['fullDate'] ?? 'No disponible', 0, 1);
        
        $pdf->SetFont('Arial', '', 11);
        $pdf->Cell(50, 7, 'Notas guardadas:', 0, 0);
        $pdf->SetFont('Arial', 'B', 11);
        $pdf->Cell(0, 7, ($calendarInfo['notesCount'] ?? 0) . ' notas', 0, 1);
        
        $pdf->SetFont('Arial', '', 11);
        $pdf->Cell(50, 7, 'Eventos destacados:', 0, 0);
        $pdf->SetFont('Arial', 'B', 11);
        $pdf->Cell(0, 7, ($calendarInfo['eventsCount'] ?? 0) . ' eventos', 0, 1);
    } else {
        $pdf->Cell(0, 7, 'No hay informacion del calendario disponible', 0, 1);
    }
    
    $pdf->Ln(5);
    
    // ANÁLISIS DE CONTRASEÑAS
    $pdf->SetFont('Arial', 'B', 14);
    $pdf->SetTextColor(0, 0, 0);
    $pdf->Cell(0, 10, 'Analisis de Contrasenas', 0, 1);
    
    $pdf->SetFont('Arial', '', 11);
    $pdf->SetTextColor(60, 60, 60);
    
    if ($passwordInfo && isset($passwordInfo['lastPassword'])) {
        $lastPwd = $passwordInfo['lastPassword'];
        
        $pdf->Cell(50, 7, 'Nivel de seguridad:', 0, 0);
        $pdf->SetFont('Arial', 'B', 11);
        
        $nivel = $lastPwd['nivel'] ?? 'No disponible';
        if ($nivel === 'Fuerte') {
            $pdf->SetTextColor(0, 150, 0);
        } elseif ($nivel === 'Media') {
            $pdf->SetTextColor(200, 150, 0);
        } else {
            $pdf->SetTextColor(200, 0, 0);
        }
        
        $pdf->Cell(0, 7, $nivel, 0, 1);
        
        $pdf->SetTextColor(60, 60, 60);
        $pdf->SetFont('Arial', '', 11);
        $pdf->Cell(50, 7, 'Puntuacion:', 0, 0);
        $pdf->SetFont('Arial', 'B', 11);
        $pdf->Cell(0, 7, ($lastPwd['score'] ?? 0) . '/100', 0, 1);
    } else {
        $pdf->Cell(0, 7, 'No hay contrasenas analizadas recientemente', 0, 1);
    }
    
    $pdf->Ln(5);
    
    // ÚLTIMOS REGISTROS DE BASE DE DATOS
    $pdf->SetFont('Arial', 'B', 14);
    $pdf->SetTextColor(0, 0, 0);
    $pdf->Cell(0, 10, 'Ultimos Registros Guardados', 0, 1);
    
    try {
        $db = getDB();
        $stmt = $db->query("SELECT nivel_seguridad, longitud, fecha_creacion 
                           FROM password_logs 
                           ORDER BY fecha_creacion DESC 
                           LIMIT 5");
        $records = $stmt->fetchAll();
        
        if (count($records) > 0) {
            // Tabla de registros
            $pdf->SetFont('Arial', 'B', 10);
            $pdf->SetFillColor(103, 126, 234);
            $pdf->SetTextColor(255, 255, 255);
            
            $pdf->Cell(40, 8, 'Fecha', 1, 0, 'C', true);
            $pdf->Cell(50, 8, 'Nivel Seguridad', 1, 0, 'C', true);
            $pdf->Cell(30, 8, 'Longitud', 1, 1, 'C', true);
            
            $pdf->SetFont('Arial', '', 9);
            $pdf->SetTextColor(0, 0, 0);
            $fill = false;
            
            foreach ($records as $record) {
                $pdf->SetFillColor(240, 240, 240);
                
                $fecha = date('d/m/Y H:i', strtotime($record['fecha_creacion']));
                $pdf->Cell(40, 7, $fecha, 1, 0, 'C', $fill);
                $pdf->Cell(50, 7, $record['nivel_seguridad'], 1, 0, 'C', $fill);
                $pdf->Cell(30, 7, $record['longitud'] . ' chars', 1, 1, 'C', $fill);
                
                $fill = !$fill;
            }
        } else {
            $pdf->SetFont('Arial', 'I', 11);
            $pdf->SetTextColor(100, 100, 100);
            $pdf->Cell(0, 7, 'No hay registros en la base de datos', 0, 1);
        }
    } catch (Exception $e) {
        $pdf->SetFont('Arial', 'I', 11);
        $pdf->SetTextColor(200, 0, 0);
        $pdf->Cell(0, 7, 'Error al obtener registros de la base de datos', 0, 1);
    }
    
    // PIE DE PÁGINA
    $pdf->SetY(-30);
    $pdf->SetFont('Arial', 'I', 9);
    $pdf->SetTextColor(150, 150, 150);
    $pdf->Cell(0, 5, 'Security Hub - Sistema de Gestion de Seguridad Digital', 0, 1, 'C');
    $pdf->Cell(0, 5, 'Generado automaticamente | Confidencial', 0, 1, 'C');
    $pdf->Cell(0, 5, 'Pagina ' . $pdf->PageNo(), 0, 0, 'C');
    
    // Registrar actividad
    logActivity('PDF_GENERATED', 'Reporte generado exitosamente');
    
    // Enviar el PDF
    $pdf->Output('D', 'Security_Hub_Reporte_' . date('Y-m-d') . '.pdf');
    
} catch (Exception $e) {
    error_log("Error en generate_pdf.php: " . $e->getMessage());
    sendError('Error al generar el PDF: ' . $e->getMessage(), 500);
}

/**
 * Generar PDF simple sin librería externa (fallback)
 */
function generateSimplePDF() {
    // Crear un PDF básico sin librerías externas
    $content = "Security Hub - Reporte\n\n";
    $content .= "Fecha: " . date('d/m/Y H:i:s') . "\n\n";
    $content .= "Este es un reporte simplificado.\n";
    $content .= "Para generar reportes completos, instala FPDF.\n\n";
    $content .= "Descarga FPDF desde: http://www.fpdf.org/\n";
    $content .= "Y colócalo en la carpeta fpdf/\n";
    
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="Security_Hub_Reporte_' . date('Y-m-d') . '.txt"');
    echo $content;
    exit;
}
?>
