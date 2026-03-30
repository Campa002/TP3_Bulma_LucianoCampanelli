/* ===================================
   Security Hub - Validador de Contraseñas
   =================================== */

// Estado del validador
const passwordState = {
    currentPassword: '',
    isValid: false,
    requirements: {
        length: false,
        number: false,
        uppercase: false,
        special: false
    },
    securityLevel: 'Sin evaluar',
    securityScore: 0
};

/**
 * Inicializar el validador de contraseñas
 */
function initPasswordValidator() {
    const passwordInput = document.getElementById('passwordInput');
    const togglePassword = document.getElementById('togglePassword');
    const saveButton = document.getElementById('btnSavePassword');
    
    // Event listener para validación en tiempo real
    passwordInput.addEventListener('input', (e) => {
        validatePassword(e.target.value);
    });
    
    // Toggle mostrar/ocultar contraseña
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        
        const icon = togglePassword.querySelector('i');
        if (type === 'password') {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        } else {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    });
    
    // Guardar contraseña
    saveButton.addEventListener('click', savePassword);
}

/**
 * Validar contraseña en tiempo real
 */
function validatePassword(password) {
    passwordState.currentPassword = password;
    
    // Resetear si está vacío
    if (!password) {
        resetValidation();
        return;
    }
    
    // Validar cada requisito
    passwordState.requirements.length = password.length >= 8;
    passwordState.requirements.number = /\d/.test(password);
    passwordState.requirements.uppercase = /[A-Z]/.test(password);
    passwordState.requirements.special = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    // Actualizar UI de requisitos
    updateRequirementsUI();
    
    // Calcular nivel de seguridad
    calculateSecurityLevel();
    
    // Actualizar barra de progreso
    updateProgressBar();
    
    // Habilitar/deshabilitar botón de guardar
    updateSaveButton();
}

/**
 * Actualizar UI de requisitos (checkmarks)
 */
function updateRequirementsUI() {
    const requirements = [
        { id: 'req-length', valid: passwordState.requirements.length },
        { id: 'req-number', valid: passwordState.requirements.number },
        { id: 'req-uppercase', valid: passwordState.requirements.uppercase },
        { id: 'req-special', valid: passwordState.requirements.special }
    ];
    
    requirements.forEach(req => {
        const element = document.getElementById(req.id);
        const icon = element.querySelector('.icon i');
        
        if (req.valid) {
            element.classList.add('valid');
            element.classList.remove('invalid');
            icon.classList.remove('fa-circle', 'fa-times-circle');
            icon.classList.add('fa-check-circle');
        } else {
            element.classList.add('invalid');
            element.classList.remove('valid');
            icon.classList.remove('fa-circle', 'fa-check-circle');
            icon.classList.add('fa-times-circle');
        }
    });
}

/**
 * Calcular nivel de seguridad
 */
function calculateSecurityLevel() {
    const password = passwordState.currentPassword;
    let score = 0;
    
    // Puntos por longitud
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 15;
    if (password.length >= 16) score += 15;
    if (password.length >= 20) score += 10;
    
    // Puntos por complejidad
    if (passwordState.requirements.number) score += 15;
    if (passwordState.requirements.uppercase) score += 15;
    if (passwordState.requirements.special) score += 15;
    
    // Puntos adicionales por variedad
    const hasLowercase = /[a-z]/.test(password);
    if (hasLowercase) score += 10;
    
    // Puntos extras por múltiples números
    const numberCount = (password.match(/\d/g) || []).length;
    if (numberCount >= 3) score += 5;
    
    // Puntos extras por múltiples caracteres especiales
    const specialCount = (password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
    if (specialCount >= 2) score += 5;
    
    // Puntos extras por mezcla de mayúsculas
    const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
    if (uppercaseCount >= 2) score += 5;
    
    passwordState.securityScore = Math.min(score, 100);
    
    // Determinar nivel con "Muy Fuerte"
    if (score < 50) {
        passwordState.securityLevel = 'Débil';
        passwordState.isValid = false;
    } else if (score < 70) {
        passwordState.securityLevel = 'Media';
        passwordState.isValid = Object.values(passwordState.requirements).every(req => req);
    } else if (score < 85) {
        passwordState.securityLevel = 'Fuerte';
        passwordState.isValid = true;
    } else {
        passwordState.securityLevel = 'Muy Fuerte';
        passwordState.isValid = true;
    }
}

/**
 * Actualizar barra de progreso
 */
function updateProgressBar() {
    const progressBar = document.getElementById('securityProgress');
    const securityLevelText = document.getElementById('securityLevel');
    
    progressBar.value = passwordState.securityScore;
    
    // Remover clases anteriores
    progressBar.classList.remove('is-danger', 'is-warning', 'is-success', 'is-very-strong');
    securityLevelText.classList.remove('has-text-danger', 'has-text-warning', 'has-text-success', 'has-text-very-strong');
    
    // Agregar clase según nivel
    if (passwordState.securityScore < 50) {
        progressBar.classList.add('is-danger');
        securityLevelText.classList.add('has-text-danger');
        securityLevelText.textContent = '🔴 Débil';
    } else if (passwordState.securityScore < 70) {
        progressBar.classList.add('is-warning');
        securityLevelText.classList.add('has-text-warning');
        securityLevelText.textContent = '🟡 Media';
    } else if (passwordState.securityScore < 85) {
        progressBar.classList.add('is-success');
        securityLevelText.classList.add('has-text-success');
        securityLevelText.textContent = '🟢 Fuerte';
    } else {
        progressBar.classList.add('is-very-strong');
        securityLevelText.classList.add('has-text-very-strong');
        securityLevelText.textContent = '🟩 Muy Fuerte';
    }
}

/**
 * Actualizar botón de guardar
 */
function updateSaveButton() {
    const saveButton = document.getElementById('btnSavePassword');
    const saveMessage = document.getElementById('saveMessage');
    
    if (passwordState.isValid) {
        saveButton.disabled = false;
        saveButton.classList.remove('is-danger');
        saveButton.classList.add('is-success');
        saveMessage.textContent = '✓ Contraseña segura. Lista para guardar.';
        saveMessage.classList.remove('has-text-danger');
        saveMessage.classList.add('has-text-success');
    } else {
        saveButton.disabled = true;
        saveButton.classList.remove('is-success');
        saveButton.classList.add('is-danger');
        
        if (passwordState.currentPassword) {
            saveMessage.textContent = '⚠ La contraseña no cumple con todos los requisitos mínimos.';
            saveMessage.classList.remove('has-text-success');
            saveMessage.classList.add('has-text-danger');
        } else {
            saveMessage.textContent = '';
        }
    }
}

/**
 * Resetear validación
 */
function resetValidation() {
    passwordState.currentPassword = '';
    passwordState.isValid = false;
    passwordState.securityScore = 0;
    passwordState.securityLevel = 'Sin evaluar';
    
    Object.keys(passwordState.requirements).forEach(key => {
        passwordState.requirements[key] = false;
    });
    
    // Resetear UI
    const requirementElements = ['req-length', 'req-number', 'req-uppercase', 'req-special'];
    requirementElements.forEach(id => {
        const element = document.getElementById(id);
        element.classList.remove('valid', 'invalid');
        const icon = element.querySelector('.icon i');
        icon.classList.remove('fa-check-circle', 'fa-times-circle');
        icon.classList.add('fa-circle');
    });
    
    // Resetear barra de progreso
    const progressBar = document.getElementById('securityProgress');
    progressBar.value = 0;
    progressBar.classList.remove('is-danger', 'is-warning', 'is-success');
    
    const securityLevelText = document.getElementById('securityLevel');
    securityLevelText.textContent = 'Sin evaluar';
    securityLevelText.classList.remove('has-text-danger', 'has-text-warning', 'has-text-success');
    
    // Resetear botón
    const saveButton = document.getElementById('btnSavePassword');
    saveButton.disabled = true;
    saveButton.classList.remove('is-success');
    saveButton.classList.add('is-danger');
    
    document.getElementById('saveMessage').textContent = '';
}

/**
 * Guardar contraseña (localStorage + intento al backend si está disponible)
 */
async function savePassword() {
    if (!passwordState.isValid) {
        alert('La contraseña no cumple con los requisitos mínimos de seguridad.');
        return;
    }

    const saveButton = document.getElementById('btnSavePassword');
    const originalText = saveButton.innerHTML;

    saveButton.disabled = true;
    saveButton.innerHTML = '<span class="icon"><i class="fas fa-spinner fa-spin"></i></span><span>Guardando...</span>';

    // Capturar datos ANTES de resetear el estado
    const record = {
        nivel: passwordState.securityLevel,
        score: passwordState.securityScore,
        longitud: passwordState.currentPassword.length,
        fecha: new Date().toISOString(),
        timestamp: new Date().toISOString()
    };

    // Guardar siempre en localStorage (funciona con o sin backend PHP)
    try {
        const logs = JSON.parse(localStorage.getItem('password_logs') || '[]');
        logs.push(record);
        if (logs.length > 20) logs.splice(0, logs.length - 20);
        localStorage.setItem('password_logs', JSON.stringify(logs));
    } catch (_) {}

    // Guardar en variable global para el PDF
    window.lastPasswordSaved = record;

    // Intentar enviar al backend (silencioso si falla)
    try {
        let calendarDate = null;
        if (window.CalendarModule && window.CalendarModule.calendarState.selectedDay) {
            calendarDate = window.CalendarModule.formatDate(window.CalendarModule.calendarState.selectedDay);
        }
        const response = await fetch('php/save_password.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                password: passwordState.currentPassword,
                nivel_seguridad: passwordState.securityLevel,
                longitud: passwordState.currentPassword.length,
                tiene_mayusculas: passwordState.requirements.uppercase,
                tiene_numeros: passwordState.requirements.number,
                tiene_especiales: passwordState.requirements.special,
                fecha_evento_calendario: calendarDate
            })
        });
        const data = await response.json();
        if (data.success) {
            showPasswordNotification('✓ Contraseña guardada exitosamente en la base de datos', 'is-success');
        } else {
            showPasswordNotification('✓ Contraseña guardada localmente', 'is-success');
        }
    } catch (_) {
        showPasswordNotification('✓ Contraseña guardada localmente', 'is-success');
    }

    // Limpiar el campo y resetear UI
    document.getElementById('passwordInput').value = '';
    resetValidation();

    saveButton.innerHTML = originalText;
    saveButton.disabled = false;
}

/**
 * Mostrar notificación para contraseñas
 */
function showPasswordNotification(message, type = 'is-info') {
    const saveMessage = document.getElementById('saveMessage');
    saveMessage.textContent = message;
    saveMessage.classList.remove('has-text-success', 'has-text-danger', 'has-text-info');
    
    if (type === 'is-success') {
        saveMessage.classList.add('has-text-success');
    } else if (type === 'is-danger') {
        saveMessage.classList.add('has-text-danger');
    } else {
        saveMessage.classList.add('has-text-info');
    }
    
    // Limpiar mensaje después de 5 segundos
    setTimeout(() => {
        saveMessage.textContent = '';
    }, 5000);
}

/**
 * Obtener información del estado actual de contraseñas (para PDF)
 */
function getPasswordInfo() {
    return {
        lastPassword: window.lastPasswordSaved || null,
        currentLevel: passwordState.securityLevel,
        currentScore: passwordState.securityScore,
        hasPassword: !!passwordState.currentPassword
    };
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPasswordValidator);
} else {
    initPasswordValidator();
}

// Exportar funciones
window.PasswordValidatorModule = {
    getPasswordInfo,
    passwordState
};