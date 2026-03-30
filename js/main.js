/* ===================================
   Security Hub - Script Principal
   =================================== */

function initApp() {
    // Inicializar tema
    initTheme();
    
    // Inicializar burger menu (navbar móvil)
    initBurgerMenu();
    
    // Inicializar generador de PDF
    initPDFGenerator();
    
    console.log('Security Hub inicializado correctamente ✓');
}

/**
 * Inicializar sistema de temas (claro/oscuro)
 */
function initTheme() {
    const themeButton = document.getElementById('btnToggleTheme');
    const body = document.body;
    
    // NO cargar tema guardado - siempre empezar en oscuro
    // El tema oscuro es el predeterminado (sin clase)
    
    // Event listener
    themeButton.addEventListener('click', () => {
        body.classList.toggle('light-theme');
        const isLight = body.classList.contains('light-theme');
        
        // Guardar preferencia
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        
        // Actualizar botón
        updateThemeButton(isLight);
        
        // Mostrar notificación
        showThemeNotification(isLight);
    });
    
    // Inicializar botón con estado correcto
    updateThemeButton(false);
}

/**
 * Actualizar texto e icono del botón de tema
 */
function updateThemeButton(isLight) {
    const button = document.getElementById('btnToggleTheme');
    const icon = button.querySelector('i');
    const text = button.querySelector('span:last-child');
    
    if (isLight) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        text.textContent = 'Tema Oscuro';
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        text.textContent = 'Tema Claro';
    }
}

/**
 * Mostrar notificación de cambio de tema
 */
function showThemeNotification(isLight) {
    const message = isLight ? '☀️ Tema claro activado' : '🌙 Tema oscuro activado';
    
    const notification = document.createElement('div');
    notification.className = 'notification is-info is-light';
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '80px';
    notification.style.right = '20px';
    notification.style.zIndex = '1000';
    notification.style.maxWidth = '300px';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

/**
 * Inicializar burger menu para móvil
 */
function initBurgerMenu() {
    const burger = document.querySelector('.navbar-burger');
    const menu = document.getElementById('navbarMenu');
    
    if (burger && menu) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('is-active');
            menu.classList.toggle('is-active');
        });
        
        // Cerrar menú al hacer click en un item
        const menuItems = menu.querySelectorAll('.navbar-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                burger.classList.remove('is-active');
                menu.classList.remove('is-active');
            });
        });
    }
}

/**
 * Inicializar generador de PDFs
 */
function initPDFGenerator() {
    const pdfButton = document.getElementById('btnGeneratePDF');
    pdfButton.addEventListener('click', generatePDF);
}

/**
 * Generar PDF usando jsPDF (client-side, sin dependencia de FPDF)
 */
async function generatePDF() {
    const button = document.getElementById('btnGeneratePDF');
    const messageDiv = document.getElementById('pdfMessage');
    const originalText = button.innerHTML;

    // Mostrar estado de carga
    button.disabled = true;
    button.innerHTML = '<span class="icon"><i class="fas fa-spinner fa-spin"></i></span><span>Generando PDF...</span>';

    messageDiv.classList.remove('is-hidden', 'is-success', 'is-danger');
    messageDiv.classList.add('is-info');
    messageDiv.textContent = '⏳ Generando reporte, por favor espere...';

    try {
        // Cargar jsPDF si no está disponible
        if (typeof window.jspdf === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        const pageW = doc.internal.pageSize.getWidth();
        const margin = 20;
        const contentW = pageW - margin * 2;
        let y = 20;

        // ── Encabezado ──────────────────────────────────────────
        doc.setFillColor(103, 126, 234);
        doc.rect(0, 0, pageW, 38, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(26);
        doc.setFont('helvetica', 'bold');
        doc.text('Security Hub', pageW / 2, 16, { align: 'center' });

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text('Reporte Mensual de Seguridad y Productividad', pageW / 2, 26, { align: 'center' });

        doc.setFontSize(9);
        doc.text(`Generado el ${new Date().toLocaleString('es-AR')}`, pageW / 2, 34, { align: 'center' });

        y = 50;

        // ── Información General ──────────────────────────────────
        doc.setTextColor(103, 126, 234);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Información General', margin, y);
        y += 2;
        doc.setDrawColor(103, 126, 234);
        doc.setLineWidth(0.4);
        doc.line(margin, y, margin + contentW, y);
        y += 7;

        doc.setTextColor(60, 60, 60);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Fecha de generación:', margin, y);
        doc.setFont('helvetica', 'bold');
        doc.text(new Date().toLocaleString('es-AR'), margin + 45, y);
        y += 7;

        doc.setFont('helvetica', 'normal');
        doc.text('Usuario:', margin, y);
        doc.setFont('helvetica', 'bold');
        doc.text('Administrador', margin + 45, y);
        y += 15;

        // ── Estado del Calendario ────────────────────────────────
        const calendarInfo = window.CalendarModule ? window.CalendarModule.getCalendarInfo() : null;

        doc.setTextColor(103, 126, 234);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Estado del Calendario', margin, y);
        y += 2;
        doc.line(margin, y, margin + contentW, y);
        y += 7;

        doc.setTextColor(60, 60, 60);
        doc.setFontSize(10);

        if (calendarInfo) {
            doc.setFont('helvetica', 'normal');
            doc.text('Mes visualizado:', margin, y);
            doc.setFont('helvetica', 'bold');
            doc.text(calendarInfo.fullDate, margin + 45, y);
            y += 7;

            doc.setFont('helvetica', 'normal');
            doc.text('Notas guardadas:', margin, y);
            doc.setFont('helvetica', 'bold');
            doc.text(`${calendarInfo.notesCount} nota(s)`, margin + 45, y);
            y += 7;

            doc.setFont('helvetica', 'normal');
            doc.text('Eventos activos:', margin, y);
            doc.setFont('helvetica', 'bold');
            doc.text(`${calendarInfo.eventsCount} evento(s)`, margin + 45, y);
            y += 7;
        } else {
            doc.setFont('helvetica', 'italic');
            doc.text('No hay información del calendario disponible.', margin, y);
            y += 7;
        }
        y += 8;

        // ── Análisis de Contraseñas ──────────────────────────────
        const passwordInfo = window.PasswordValidatorModule ? window.PasswordValidatorModule.getPasswordInfo() : null;

        doc.setTextColor(103, 126, 234);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Análisis de Contraseñas', margin, y);
        y += 2;
        doc.line(margin, y, margin + contentW, y);
        y += 7;

        doc.setFontSize(10);

        if (passwordInfo && passwordInfo.lastPassword) {
            const lp = passwordInfo.lastPassword;
            const nivel = lp.nivel || 'No disponible';

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            doc.text('Último nivel de seguridad:', margin, y);

            // Color según nivel
            if (nivel === 'Fuerte' || nivel === 'Muy Fuerte') {
                doc.setTextColor(5, 150, 105);
            } else if (nivel === 'Media') {
                doc.setTextColor(200, 150, 0);
            } else {
                doc.setTextColor(200, 0, 0);
            }
            doc.setFont('helvetica', 'bold');
            doc.text(nivel, margin + 60, y);
            y += 7;

            doc.setTextColor(60, 60, 60);
            doc.setFont('helvetica', 'normal');
            doc.text('Puntuación:', margin, y);
            doc.setFont('helvetica', 'bold');
            doc.text(`${lp.score ?? 0}/100`, margin + 60, y);
            y += 7;

            if (lp.timestamp) {
                doc.setFont('helvetica', 'normal');
                doc.text('Fecha análisis:', margin, y);
                doc.setFont('helvetica', 'bold');
                doc.text(new Date(lp.timestamp).toLocaleString('es-AR'), margin + 60, y);
                y += 7;
            }
        } else if (passwordInfo && passwordInfo.hasPassword) {
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100, 100, 100);
            doc.text(`Contraseña en evaluación - Nivel actual: ${passwordInfo.currentLevel}`, margin, y);
            y += 7;
        } else {
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100, 100, 100);
            doc.text('No hay contraseñas analizadas recientemente.', margin, y);
            y += 7;
        }
        y += 8;

        // ── Últimos Registros (localStorage) ────────────────────
        doc.setTextColor(103, 126, 234);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Últimos Registros Guardados', margin, y);
        y += 2;
        doc.setDrawColor(103, 126, 234);
        doc.line(margin, y, margin + contentW, y);
        y += 7;

        // Intentar recuperar registros del localStorage (guardados por save_password si existe)
        let records = [];
        try {
            const stored = localStorage.getItem('password_logs');
            if (stored) records = JSON.parse(stored).slice(-5).reverse();
        } catch (_) {}

        if (records.length > 0) {
            // Encabezado tabla
            doc.setFillColor(103, 126, 234);
            doc.rect(margin, y, contentW, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            const col1 = margin + 2, col2 = margin + 75, col3 = margin + 130;
            doc.text('Fecha', col1, y + 5.5);
            doc.text('Nivel Seguridad', col2, y + 5.5);
            doc.text('Longitud', col3, y + 5.5);
            y += 8;

            records.forEach((rec, i) => {
                if (i % 2 === 0) {
                    doc.setFillColor(240, 240, 245);
                    doc.rect(margin, y, contentW, 7, 'F');
                }
                doc.setTextColor(60, 60, 60);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                const fecha = rec.fecha ? new Date(rec.fecha).toLocaleString('es-AR') : 'N/D';
                doc.text(fecha, col1, y + 5);
                doc.text(rec.nivel || 'N/D', col2, y + 5);
                doc.text(`${rec.longitud ?? 'N/D'} chars`, col3, y + 5);
                y += 7;
            });
        } else {
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(10);
            doc.text('No hay registros guardados localmente.', margin, y);
            y += 7;
        }

        // ── Pie de página ────────────────────────────────────────
        const pageH = doc.internal.pageSize.getHeight();
        doc.setFillColor(240, 240, 245);
        doc.rect(0, pageH - 18, pageW, 18, 'F');
        doc.setDrawColor(103, 126, 234);
        doc.setLineWidth(0.5);
        doc.line(0, pageH - 18, pageW, pageH - 18);

        doc.setTextColor(120, 120, 120);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text('Security Hub - Sistema de Gestión de Seguridad Digital', pageW / 2, pageH - 11, { align: 'center' });
        doc.text('Generado automáticamente | Confidencial', pageW / 2, pageH - 6, { align: 'center' });

        // Descargar
        const filename = `Security_Hub_Reporte_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);

        // Éxito
        messageDiv.classList.remove('is-info');
        messageDiv.classList.add('is-success');
        messageDiv.innerHTML = '<strong>✓ PDF generado exitosamente</strong><br>El archivo ha sido descargado.';

        setTimeout(() => {
            messageDiv.classList.add('is-hidden');
        }, 5000);

    } catch (error) {
        console.error('Error al generar PDF:', error);
        messageDiv.classList.remove('is-info');
        messageDiv.classList.add('is-danger');
        messageDiv.innerHTML = `<strong>✗ Error al generar PDF</strong><br>${error.message}`;
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

/**
 * Cargar un script externo dinámicamente
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`No se pudo cargar: ${src}`));
        document.head.appendChild(script);
    });
}

/**
 * Smooth scroll para los enlaces del navbar
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

/**
 * Animaciones al hacer scroll (opcional)
 */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1
    });
    
    document.querySelectorAll('.box').forEach(box => {
        observer.observe(box);
    });
}

/**
 * Manejo de errores global
 */
window.addEventListener('error', (event) => {
    console.error('Error global capturado:', event.error);
});

/**
 * Prevenir pérdida de datos al cerrar
 */
window.addEventListener('beforeunload', (event) => {
    const passwordInput = document.getElementById('passwordInput');
    const dayNotes = document.getElementById('dayNotes');
    
    if (passwordInput && passwordInput.value && !window.lastPasswordSaved) {
        event.preventDefault();
        event.returnValue = '¿Tienes una contraseña sin guardar. ¿Seguro que quieres salir?';
        return event.returnValue;
    }
    
    if (dayNotes && dayNotes.value && dayNotes.style.display !== 'none') {
        const currentNote = dayNotes.value;
        const dateString = document.getElementById('selectedDayLabel')?.textContent;
        
        if (dateString) {
            const savedNote = window.CalendarModule?.calendarState.notes[dateString];
            if (currentNote !== savedNote) {
                event.preventDefault();
                event.returnValue = 'Tienes notas sin guardar. ¿Seguro que quieres salir?';
                return event.returnValue;
            }
        }
    }
});

/**
 * Inicializar cuando el DOM esté listo
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initApp();
        initSmoothScroll();
    });
} else {
    initApp();
    initSmoothScroll();
}

