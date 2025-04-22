// Función para cargar componentes
async function loadComponent(componentName, containerId) {
    try {
        const response = await fetch(`components/${componentName}.html`);
        if (!response.ok) throw new Error('Componente no encontrado');
        
        const html = await response.text();
        document.getElementById(containerId).innerHTML = html;
        return true; // Indica que el componente se cargó correctamente
    } catch (error) {
        console.error(`Error cargando ${componentName}:`, error);
        document.getElementById(containerId).innerHTML = 
            `<p class="error">Error cargando el componente ${componentName}</p>`;
        return false;
    }
}

// Cargar todos los componentes
async function loadAllComponents() {
    // Cargar componentes en paralelo para mejor rendimiento
    const loadPromises = [
        loadComponent('sidebar', 'sidebar-container'),
        loadComponent('header', 'header-container'),
        loadComponent('chat', 'chat-container')
    ];

    // Esperar a que todos los componentes se carguen
    const results = await Promise.all(loadPromises);
    const allLoaded = results.every(result => result === true);

    if (allLoaded) {
        // Notificar que los componentes están listos
        document.dispatchEvent(new CustomEvent('components-loaded', {
            detail: {
                timestamp: new Date(),
                components: ['sidebar', 'header', 'chat']
            }
        }));
        
        // Inicializar scripts básicos
        initializeBasicScripts();
    } else {
        console.error('Algunos componentes no se cargaron correctamente');
    }
}

// Función para inicializar scripts básicos (que no dependen de componentes dinámicos)
function initializeBasicScripts() {
    // Ejemplo de interacción sencilla
    document.getElementById('saludoBtn')?.addEventListener('click', function() {
        document.getElementById('mensaje').textContent = '¡Gracias por visitar nuestra página!';
    });
    
    // Cambiar color de fondo al pasar el ratón sobre el título
    const titulo = document.querySelector('h1');
    titulo?.addEventListener('mouseover', function() {
        this.style.color = '#e8491d';
    });
    
    titulo?.addEventListener('mouseout', function() {
        this.style.color = 'white';
    });
}

// Cargar componentes cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM completamente cargado, iniciando carga de componentes');
    loadAllComponents().catch(error => {
        console.error('Error al cargar componentes:', error);
    });
});

// Opcional: Exportar funciones para acceso desde otros scripts
if (typeof window !== 'undefined') {
    window.ComponentLoader = {
        loadComponent,
        loadAllComponents,
        initializeBasicScripts
    };
}