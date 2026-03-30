/* ===================================
   Security Hub - Módulo de Calendario
   =================================== */

// Estado global del calendario
const calendarState = {
    currentDate: new Date(),
    selectedDay: null,
    events: {
        // Eventos destacados (formato: 'YYYY-MM-DD')
        '2026-03-15': {
            title: 'Copa Mundial - Partido Inaugural',
            description: 'Comienza la Copa del Mundo 2026',
            type: 'mundial'
        },
        '2026-03-18': {
            title: 'Copa Mundial - Fase de Grupos',
            description: 'Argentina vs México - 16:00 hs',
            type: 'mundial'
        },
        '2026-03-22': {
            title: 'Copa Mundial - Fase de Grupos',
            description: 'Argentina vs Polonia - 20:00 hs',
            type: 'mundial'
        },
        '2026-03-24': {
            title: 'Día Nacional de la Memoria',
            description: 'Por la Verdad y la Justicia',
            type: 'efemeride'
        },
        '2026-03-29': {
            title: 'Hoy - Día Actual',
            description: 'Clase de Full Stack Development',
            type: 'actual'
        },
        '2026-04-02': {
            title: 'Día del Veterano',
            description: 'Día del Veterano y de los Caídos en la Guerra de Malvinas',
            type: 'efemeride'
        }
    },
    customEvents: {}, // Eventos personalizados del usuario
    deletedEvents: {}, // Eventos predefinidos eliminados por el usuario
    notes: {} // Notas guardadas en localStorage
};

// Días de la semana
const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Meses del año
const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Inicializar el calendario
 */
function initCalendar() {
    // Cargar notas desde localStorage
    loadNotesFromStorage();
    
    // Cargar eventos personalizados desde localStorage
    loadCustomEventsFromStorage();

    // Cargar eventos eliminados desde localStorage
    loadDeletedEventsFromStorage();
    
    // Renderizar el calendario
    renderCalendar();
    
    // Event listeners
    document.getElementById('btnPrevMonth').addEventListener('click', previousMonth);
    document.getElementById('btnNextMonth').addEventListener('click', nextMonth);
    document.getElementById('btnSaveNote').addEventListener('click', saveNote);
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('modalCloseButton').addEventListener('click', closeModal);
    
    // Cerrar modal al hacer click en el fondo
    document.querySelector('.modal-background')?.addEventListener('click', closeModal);
}

/**
 * Renderizar el calendario completo
 */
function renderCalendar() {
    const year = calendarState.currentDate.getFullYear();
    const month = calendarState.currentDate.getMonth();
    
    // Actualizar título del mes
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
    
    // Limpiar el grid
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    // Agregar headers de días de la semana
    daysOfWeek.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.textContent = day;
        calendarGrid.appendChild(header);
    });
    
    // Obtener primer y último día del mes
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Días del mes anterior (para rellenar)
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        const dayElement = createDayElement(day, true, false);
        calendarGrid.appendChild(dayElement);
    }
    
    // Días del mes actual
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isToday = date.toDateString() === today.toDateString();
        const dayElement = createDayElement(day, false, isToday, date);
        calendarGrid.appendChild(dayElement);
    }
    
    // Días del siguiente mes (para completar el grid)
    const remainingCells = 42 - (startingDayOfWeek + daysInMonth); // 6 semanas * 7 días
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, true, false);
        calendarGrid.appendChild(dayElement);
    }
}

/**
 * Crear elemento de día individual
 */
function createDayElement(day, isOtherMonth, isToday, date = null) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
        return dayElement;
    }
    
    if (isToday) {
        dayElement.classList.add('today');
    }
    
    // Verificar si es fin de semana
    if (date && (date.getDay() === 0 || date.getDay() === 6)) {
        dayElement.classList.add('weekend');
    }
    
    // Verificar si hay eventos
    if (date) {
        const dateString = formatDate(date);
        
        // Combinar eventos predefinidos (no eliminados) y personalizados
        const allEvents = getActiveEvents();
        
        if (allEvents[dateString]) {
            dayElement.classList.add('has-event');
        }
        
        // Verificar si hay notas
        if (calendarState.notes[dateString]) {
            dayElement.classList.add('has-note');
        }
        
        // Event listener para click
        dayElement.addEventListener('click', () => selectDay(date, day));
    }
    
    return dayElement;
}

/**
 * Obtener todos los eventos activos (predefinidos no eliminados + personalizados)
 */
function getActiveEvents() {
    const predefined = {};
    for (const key in calendarState.events) {
        if (!calendarState.deletedEvents[key]) {
            predefined[key] = calendarState.events[key];
        }
    }
    return { ...predefined, ...calendarState.customEvents };
}

/**
 * Seleccionar un día
 */
function selectDay(date, day) {
    calendarState.selectedDay = date;
    const dateString = formatDate(date);
    
    // Mostrar modal con información del día
    showDayModal(date, day, dateString);
    
    // Mostrar sección de notas
    showNotesSection(dateString);
}

/**
 * Mostrar modal con información del día
 */
function showDayModal(date, day, dateString) {
    const modal = document.getElementById('eventModal');
    const modalTitle = document.getElementById('modalDayTitle');
    const modalContent = document.getElementById('modalEventContent');
    
    modalTitle.textContent = `${day} de ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    
    const allEvents = getActiveEvents();
    const isCustom = !!calendarState.customEvents[dateString];
    const isPredefined = !!calendarState.events[dateString] && !calendarState.deletedEvents[dateString];
    const hasEvent = !!allEvents[dateString];
    
    if (hasEvent) {
        const event = allEvents[dateString];
        
        modalContent.innerHTML = `
            <article class="message is-info">
                <div class="message-header">
                    <p>${event.title}</p>
                    <button class="delete" id="deleteEvent" title="Eliminar evento"></button>
                </div>
                <div class="message-body">
                    ${event.description}
                    ${isCustom ? '<br><small class="has-text-info">📌 Evento personalizado</small>' : ''}
                </div>
            </article>
            ${isCustom ? `
            <div class="buttons is-centered mt-3">
                <button class="button is-warning is-small" id="editEvent">
                    <span class="icon"><i class="fas fa-edit"></i></span>
                    <span>Editar Evento</span>
                </button>
            </div>
            ` : ''}
            <hr>
            <button class="button is-primary is-fullwidth" id="addNewEvent">
                <span class="icon"><i class="fas fa-plus"></i></span>
                <span>${isCustom ? 'Reemplazar' : 'Agregar Nuevo'} Evento</span>
            </button>
        `;
        
        // Eliminar: custom se borra de customEvents, predefinido se agrega a deletedEvents
        document.getElementById('deleteEvent')?.addEventListener('click', () => {
            if (isCustom) {
                deleteCustomEvent(dateString);
            } else {
                deletePredefinedEvent(dateString);
            }
        });

        if (isCustom) {
            document.getElementById('editEvent')?.addEventListener('click', () => showEventForm(dateString, event));
        }
        document.getElementById('addNewEvent')?.addEventListener('click', () => showEventForm(dateString));
        
    } else {
        modalContent.innerHTML = `
            <div class="notification is-light">
                <p>No hay eventos especiales para este día.</p>
                <p class="mt-2">¡Puedes agregar un evento personalizado o notas usando las opciones debajo!</p>
            </div>
            <button class="button is-primary is-fullwidth mt-3" id="addNewEvent">
                <span class="icon"><i class="fas fa-plus"></i></span>
                <span>Agregar Evento Especial</span>
            </button>
        `;
        
        document.getElementById('addNewEvent')?.addEventListener('click', () => showEventForm(dateString));
    }
    
    modal.classList.add('is-active');
}

/**
 * Cerrar modal
 */
function closeModal() {
    document.getElementById('eventModal').classList.remove('is-active');
}

/**
 * Mostrar sección de notas
 */
function showNotesSection(dateString) {
    const notesSection = document.getElementById('dayNotesSection');
    const selectedDayLabel = document.getElementById('selectedDayLabel');
    const dayNotesTextarea = document.getElementById('dayNotes');
    
    selectedDayLabel.textContent = dateString;
    dayNotesTextarea.value = calendarState.notes[dateString] || '';
    
    notesSection.style.display = 'block';
}

/**
 * Guardar nota
 */
function saveNote() {
    if (!calendarState.selectedDay) return;
    
    const dateString = formatDate(calendarState.selectedDay);
    const noteContent = document.getElementById('dayNotes').value.trim();
    
    if (noteContent) {
        calendarState.notes[dateString] = noteContent;
        localStorage.setItem('calendar_notes', JSON.stringify(calendarState.notes));
        
        // Mostrar mensaje de éxito
        showNotification('Nota guardada exitosamente', 'is-success');
        
        // Re-renderizar calendario para mostrar indicador
        renderCalendar();
    } else {
        // Si está vacío, eliminar la nota
        delete calendarState.notes[dateString];
        localStorage.setItem('calendar_notes', JSON.stringify(calendarState.notes));
        showNotification('Nota eliminada', 'is-info');
        renderCalendar();
    }
}

/**
 * Cargar notas desde localStorage
 */
function loadNotesFromStorage() {
    const savedNotes = localStorage.getItem('calendar_notes');
    if (savedNotes) {
        try {
            calendarState.notes = JSON.parse(savedNotes);
        } catch (e) {
            console.error('Error al cargar notas:', e);
            calendarState.notes = {};
        }
    }
}

/**
 * Cargar eventos personalizados desde localStorage
 */
function loadCustomEventsFromStorage() {
    const savedEvents = localStorage.getItem('calendar_custom_events');
    if (savedEvents) {
        try {
            calendarState.customEvents = JSON.parse(savedEvents);
        } catch (e) {
            console.error('Error al cargar eventos personalizados:', e);
            calendarState.customEvents = {};
        }
    }
}

/**
 * Cargar eventos predefinidos eliminados desde localStorage
 */
function loadDeletedEventsFromStorage() {
    const saved = localStorage.getItem('calendar_deleted_events');
    if (saved) {
        try {
            calendarState.deletedEvents = JSON.parse(saved);
        } catch (e) {
            console.error('Error al cargar eventos eliminados:', e);
            calendarState.deletedEvents = {};
        }
    }
}

/**
 * Mostrar formulario para agregar/editar evento
 */
function showEventForm(dateString, existingEvent = null) {
    const modalContent = document.getElementById('modalEventContent');
    
    const title = existingEvent ? existingEvent.title : '';
    const description = existingEvent ? existingEvent.description : '';
    
    modalContent.innerHTML = `
        <div class="box" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
            <h4 class="subtitle is-5 has-text-cyan">
                <i class="fas fa-calendar-plus mr-2"></i>
                ${existingEvent ? 'Editar' : 'Nuevo'} Evento Especial
            </h4>
            
            <div class="field">
                <label class="label">Título del Evento:</label>
                <div class="control has-icons-left">
                    <input class="input" type="text" id="eventTitle" placeholder="Ej: Cumpleaños, Reunión, etc." value="${title}">
                    <span class="icon is-small is-left">
                        <i class="fas fa-heading"></i>
                    </span>
                </div>
            </div>
            
            <div class="field">
                <label class="label">Descripción:</label>
                <div class="control">
                    <textarea class="textarea" id="eventDescription" placeholder="Detalles del evento..." rows="3">${description}</textarea>
                </div>
            </div>
            
            <div class="buttons is-centered mt-4">
                <button class="button is-success" id="saveEvent">
                    <span class="icon"><i class="fas fa-save"></i></span>
                    <span>Guardar Evento</span>
                </button>
                <button class="button is-light" id="cancelEvent">
                    <span class="icon"><i class="fas fa-times"></i></span>
                    <span>Cancelar</span>
                </button>
            </div>
        </div>
    `;
    
    // Event listeners
    document.getElementById('saveEvent').addEventListener('click', () => saveCustomEvent(dateString));
    document.getElementById('cancelEvent').addEventListener('click', () => {
        const modal = document.getElementById('eventModal');
        modal.classList.remove('is-active');
    });
    
    // Focus en el campo de título
    setTimeout(() => {
        document.getElementById('eventTitle')?.focus();
    }, 100);
}

/**
 * Guardar evento personalizado
 */
function saveCustomEvent(dateString) {
    const title = document.getElementById('eventTitle').value.trim();
    const description = document.getElementById('eventDescription').value.trim();
    
    if (!title) {
        alert('Por favor ingresa un título para el evento');
        return;
    }
    
    // Guardar en customEvents
    calendarState.customEvents[dateString] = {
        title: title,
        description: description || 'Sin descripción',
        type: 'custom'
    };
    
    // Guardar en localStorage
    localStorage.setItem('calendar_custom_events', JSON.stringify(calendarState.customEvents));
    
    // Cerrar modal
    closeModal();
    
    // Mostrar notificación
    showNotification('✓ Evento guardado exitosamente', 'is-success');
    
    // Re-renderizar calendario
    renderCalendar();
}

/**
 * Eliminar evento personalizado (creado por el usuario)
 */
function deleteCustomEvent(dateString) {
    if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
        delete calendarState.customEvents[dateString];
        localStorage.setItem('calendar_custom_events', JSON.stringify(calendarState.customEvents));
        
        closeModal();
        showNotification('✓ Evento eliminado', 'is-info');
        renderCalendar();
    }
}

/**
 * Eliminar (ocultar) evento predefinido del calendario
 */
function deletePredefinedEvent(dateString) {
    if (confirm('¿Estás seguro de que quieres eliminar este evento? Esta acción se puede revertir limpiando el almacenamiento local.')) {
        calendarState.deletedEvents[dateString] = true;
        localStorage.setItem('calendar_deleted_events', JSON.stringify(calendarState.deletedEvents));
        
        closeModal();
        showNotification('✓ Evento eliminado', 'is-info');
        renderCalendar();
    }
}

/**
 * Mes anterior
 */
function previousMonth() {
    calendarState.currentDate.setMonth(calendarState.currentDate.getMonth() - 1);
    renderCalendar();
}

/**
 * Mes siguiente
 */
function nextMonth() {
    calendarState.currentDate.setMonth(calendarState.currentDate.getMonth() + 1);
    renderCalendar();
}

/**
 * Formatear fecha a string YYYY-MM-DD
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Obtener información del estado actual del calendario (para PDF)
 */
function getCalendarInfo() {
    const year = calendarState.currentDate.getFullYear();
    const month = calendarState.currentDate.getMonth();
    return {
        monthName: monthNames[month],
        year: year,
        fullDate: `${monthNames[month]} ${year}`,
        notesCount: Object.keys(calendarState.notes).length,
        eventsCount: Object.keys(getActiveEvents()).length
    };
}

/**
 * Mostrar notificación temporal
 */
function showNotification(message, type = 'is-info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <button class="delete"></button>
        ${message}
    `;
    
    // Insertar en el body
    document.body.appendChild(notification);
    
    // Posicionar en la esquina superior derecha
    notification.style.position = 'fixed';
    notification.style.top = '80px';
    notification.style.right = '20px';
    notification.style.zIndex = '1000';
    notification.style.maxWidth = '400px';
    
    // Event listener para cerrar
    notification.querySelector('.delete').addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalendar);
} else {
    initCalendar();
}

// Exportar funciones para usar en otros módulos
window.CalendarModule = {
    getCalendarInfo,
    formatDate,
    calendarState
};