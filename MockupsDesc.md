# 📱 Descripciones de Pantallas – Genaro DFT 2.0

## 1. **Pantalla Principal – Unified Command Dashboard**

**Objetivo:** punto único de control con visión ejecutiva.

* **Encabezado superior:** logo Genaro, selector de periodo (últimas 24h, 7 días, 30 días), notificaciones y avatar del usuario.
* **Panel de alertas rápidas (banner):** tres indicadores principales con colores tipo semáforo:

  * “Narrativas emergentes detectadas” (ej. 12)
  * “Riesgos críticos activos” (ej. 3 – Deepfake, Coordinated Bot Activity, Sentiment Crash)
  * “Forecasts a 72h” (ej. 5 narrativas en riesgo de escalar).
* **Gráfico central tipo “heatmap narrativo”:** clusters de conversación con tamaño proporcional a volumen y color según sentimiento.
* **Panel lateral derecho:** “Top Narrativas” con tarjetas expandibles que muestran título, % de sentimiento positivo/negativo, regiones principales, probabilidad de viralidad.
* **Sección inferior:** accesos rápidos a módulos: Narrative Tracker | Risk & Integrity | Sandbox | Briefings.

---

## 2. **Pantalla Narrative Tracker – Ficha de Narrativa**

**Objetivo:** ofrecer un “dossier vivo” de cada narrativa.

* **Encabezado:** título de la narrativa (ej. “Nueva política fiscal”), resumen automático de 1–2 líneas generado por Genaro.
* **Indicadores clave (tarjetas numéricas):**

  * Volumen de menciones totales
  * Distribución de sentimiento (barras −3 a +3)
  * Emoción dominante (ira, confianza, miedo, etc.)
  * Probabilidad de crecimiento (ej. 78% en 72h).
* **Gráfico temporal:** línea que muestra evolución de menciones y sentimiento en el tiempo.
* **Mapa geográfico interactivo:** regiones donde más impacta la narrativa, con zoom.
* **Lista de influenciadores clave:** usuarios, medios o cuentas más relevantes (anónimos si aplica, salvo fuentes verificadas).
* **Panel lateral con insights de Genaro:** frases en lenguaje natural tipo:

  * “Esta narrativa está siendo amplificada por 3 clusters coordinados en la región X.”
  * “El riesgo reputacional para el sector financiero es ALTO.”

---

## 3. **Pantalla Risk & Integrity – Alertas de Manipulación**

**Objetivo:** detectar deepfakes, bots y campañas inauténticas.

* **Encabezado:** contador de riesgos activos, categorizados por severidad (Sev-High, Sev-Medium, Sev-Low).
* **Gráfico tipo radar:** muestra relación entre “volumen” y “nivel de riesgo” de cada narrativa.
* **Tabla de alertas:** columnas = Narrativa | Tipo de Riesgo (Bot, Deepfake, Coordinación) | Evidencia (ej. enlace, hash, captura) | Severidad | Estado (Pendiente, En revisión, Mitigado).
* **Detalle de alerta (modal):**

  * Evidencias visuales (ej. frame de video deepfake con puntuación 0.87 “likely synthetic”).
  * Explicación de modelo: drivers del riesgo.
  * Botón para exportar “Bundle de Evidencia” en PDF.

---

## 4. **Pantalla Sandbox Studio – Estrategias en Simulación**

**Objetivo:** probar escenarios y contra-narrativas en entorno seguro.

* **Encabezado:** selector de narrativa objetivo (ej. “#CrisisAmbiental”) y botón “Clonar escenario actual”.
* **Escenario visualizado como tablero:**

  * Panel izquierdo: cohortes de audiencia (ej. clientes premium, reguladores, jóvenes urbanos).
  * Panel central: editor de mensajes con variantes A, B, C (ej. tweet, comunicado, video corto).
  * Panel derecho: resultados proyectados por Genaro → métricas simuladas: cambio en sentimiento, share of voice, probabilidad de viralidad, riesgo ético.
* **Indicadores de comparación:** gráfico de barras que muestra eficacia relativa de cada variante.
* **Checklist de ética automático:**

  * “¿Contiene manipulación basada en miedo?” → NO
  * “¿Respeta lineamientos de datos sensibles?” → SÍ
  * “¿Cumple con GDPR/CCPA?” → SÍ

---

## 5. **Pantalla Executive Briefing – Reportes Automáticos**

**Objetivo:** entregar insights claros a C-Level o stakeholders externos.

* **Encabezado:** “Weekly Reputation Briefing – Generado por Genaro”.
* **Resumen ejecutivo en lenguaje natural:** 3–4 bullets redactados automáticamente:

  * “La narrativa X ha crecido un 45% y tiene alta probabilidad de afectar reputación sectorial.”
  * “Se detectó un deepfake de la figura Y con distribución moderada en Latinoamérica.”
* **Gráficos principales (insertados automáticamente):** top 3 narrativas, mapa de calor geográfico, curva de sentimiento.
* **Sección “Acciones Recomendadas”:** lista priorizada con justificación (ej. “Acción A puede contener la crisis con 40% más eficacia que Acción B”).
* **Pie de página:** disclaimer ético + timestamp + hash de auditoría.

---

## 6. Pantalla Advertising Dashboard – FINOPS & Performance

**Objetivo:** consolidar y analizar el rendimiento de las campañas publicitarias y su impacto en las narrativas.

*   **Encabezado:** selector de plataforma (Meta, Google, Todas), selector de periodo (últimos 7 días, 30 días, custom), y un indicador de "Gasto Total".
*   **Panel de KPIs principales (tarjetas numéricas):**
    *   Gasto Total (ej. $150,000)
    *   Impresiones Totales (ej. 25,000,000)
    *   Clicks Totales (ej. 1,200,000)
    *   Conversiones Totales (ej. 12,000)
    *   Costo Por Click (CPC) Promedio (ej. $0.12)
    *   Costo Por Adquisición (CPA) Promedio (ej. $12.50)
*   **Gráfico de Gasto vs. Rendimiento:** un gráfico de área que muestra el gasto diario superpuesto con una línea de una métrica de rendimiento seleccionable (Impresiones, Clicks, Conversiones).
*   **Tabla de Campañas:** una tabla detallada de todas las campañas activas con las siguientes columnas:
    *   Nombre de la Campaña
    *   Plataforma (Meta/Google)
    *   Gasto
    *   Impresiones
    *   Clicks
    *   Conversiones
    *   CPC
    *   CPA
    *   Narrativa Asociada (etiqueta que vincula la campaña a una narrativa)
*   **Panel Lateral de Correlación Narrativa:**
    *   Un gráfico de dispersión que muestra la correlación entre el "Gasto en Publicidad" (eje X) y el "Cambio en el Sentimiento de la Narrativa" (eje Y).
    *   Insights de Genaro en lenguaje natural, como:
        *   "La campaña 'Campaña de Verano' ha incrementado el sentimiento positivo de la narrativa 'Sostenibilidad' en un 15% con un gasto de $25,000."
        *   "Se recomienda reasignar el 20% del presupuesto de la campaña 'Campaña de Otoño' a la 'Campaña de Invierno' para un mayor impacto en la narrativa 'Innovación'."
*   **Filtros:** la capacidad de filtrar toda la pantalla por campaña, conjunto de anuncios, y narrativa asociada.
