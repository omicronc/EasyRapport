/*
 * EasyRapport - Chrome extension for task-based report generation.
 * Copyright (C) 2026 EasyRapport
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

const titleInput = document.getElementById('reportTitle')
const dateInput = document.getElementById('reportDate')
const authorInput = document.getElementById('reportAuthor')
const addTaskBtn = document.getElementById('addTaskBtn')
const tasksContainer = document.getElementById('tasksContainer')
const generateBtn = document.getElementById('generateBtn')
const copyBtn = document.getElementById('copyBtn')
const preview = document.getElementById('preview')
const resetBtn = document.getElementById('resetBtn')

let state = { meta: { title: '', date: '', author: '' }, tasks: [] }

function todayISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDateFR(dateStr) {
  try {
    const d = new Date(dateStr + 'T00:00:00')
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return dateStr
  }
}

function weekdayFR(dateStr) {
  try {
    const d = new Date(dateStr + 'T00:00:00')
    return new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(d)
  } catch {
    return ''
  }
}

function setAutoTitleFromDate() {
  const wd = weekdayFR(state.meta.date)
  if (wd) {
    const wdl = wd.toLowerCase()
    state.meta.title = `Rapport du ${wdl}`
    titleInput.value = state.meta.title
  }
}

function loadState() {
  chrome.storage.local.get(['easyrapport_state'], res => {
    if (res.easyrapport_state) state = res.easyrapport_state
    if (!state.meta) state.meta = { title: '', date: '', author: '' }
    if (!state.meta.date) state.meta.date = todayISO()
    if (!state.meta.title) setAutoTitleFromDate()
    titleInput.readOnly = false
    titleInput.value = state.meta.title || ''
    dateInput.value = state.meta.date || todayISO()
    authorInput.value = state.meta.author || ''
    renderTasks()
    updatePreview()
  })
}

function saveState() {
  chrome.storage.local.set({ easyrapport_state: state })
}

function createTask() {
  return { title: '', description: '' }
}

function addTask() {
  state.tasks.push(createTask())
  renderTasks()
  saveState()
  updatePreview()
}

function removeTask(index) {
  state.tasks.splice(index, 1)
  renderTasks()
  saveState()
  updatePreview()
}

function taskElement(task, index) {
  const wrapper = document.createElement('div')
  wrapper.className = 'task'

  const titleField = document.createElement('div')
  titleField.className = 'field'
  const titleLabel = document.createElement('label')
  titleLabel.textContent = 'Titre'
  const titleInput = document.createElement('input')
  titleInput.type = 'text'
  titleInput.spellcheck = true
  titleInput.value = task.title
  titleField.appendChild(titleLabel)
  titleField.appendChild(titleInput)

  const descField = document.createElement('div')
  descField.className = 'field'
  const descLabel = document.createElement('label')
  descLabel.textContent = 'Description'
  const descInput = document.createElement('textarea')
  descInput.value = task.description
  descInput.spellcheck = true
  descField.appendChild(descLabel)
  descField.appendChild(descInput)

  const actions = document.createElement('div')
  actions.className = 'task-actions'
  const removeBtn = document.createElement('button')
  removeBtn.className = 'secondary'
  removeBtn.textContent = 'Supprimer'
  actions.appendChild(removeBtn)

  wrapper.appendChild(titleField)
  wrapper.appendChild(descField)
  wrapper.appendChild(actions)

  titleInput.addEventListener('input', e => {
    state.tasks[index].title = e.target.value
    saveState()
    updatePreview()
  })
  descInput.addEventListener('input', e => {
    state.tasks[index].description = e.target.value
    saveState()
    updatePreview()
  })
  removeBtn.addEventListener('click', () => removeTask(index))

  return wrapper
}

function renderTasks() {
  tasksContainer.innerHTML = ''
  state.tasks.forEach((t, i) => {
    tasksContainer.appendChild(taskElement(t, i))
  })
}

function escapeHtml(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function generateReportHTML() {
  const meta = state.meta
  const tasks = state.tasks
  const frDate = meta.date ? formatDateFR(meta.date) : ''
  const safeTitle = escapeHtml(meta.title || '')
  const safeAuthor = escapeHtml(meta.author || '')
  const head = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <div style="font-weight:700;font-size:16px;color:#0f172a">EasyRapport</div>
      <div style="font-size:12px;color:#64748b">Rapport des tâches réalisées</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 160px 160px;gap:8px;margin-bottom:12px">
      <div style="padding:8px 10px;border:1px solid #e5e7eb;border-radius:8px;background:#f8fafc"><span style="font-size:12px;color:#64748b">Titre</span><div style="font-weight:600;color:#0f172a">${safeTitle}</div></div>
      <div style="padding:8px 10px;border:1px solid #e5e7eb;border-radius:8px;background:#f8fafc"><span style="font-size:12px;color:#64748b">Date</span><div style="font-weight:600;color:#0f172a;text-transform:capitalize">${frDate}</div></div>
      <div style="padding:8px 10px;border:1px solid #e5e7eb;border-radius:8px;background:#f8fafc"><span style="font-size:12px;color:#64748b">Auteur</span><div style="font-weight:600;color:#0f172a">${safeAuthor}</div></div>
    </div>
  `
  const items = tasks
    .filter(t => (t.title || '').trim() !== '' || (t.description || '').trim() !== '')
    .map((t, i) => {
      const itemTitle = escapeHtml(t.title || 'Tâche ' + (i + 1))
      const itemDescription = escapeHtml(t.description || '').replace(/\n/g, '<br>')
      return `
        <div style="border:1px solid #e5e7eb;border-radius:12px;padding:12px;margin-bottom:10px;background:#ffffff">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <div style="font-weight:600;color:#0f172a">${itemTitle}</div>
          </div>
          <div style="font-size:14px;line-height:1.5;color:#334155">${itemDescription}</div>
        </div>
      `
    }).join('')
  return `
    <div style="max-width:760px;margin:0;padding:16px;border:1px solid #e5e7eb;border-radius:14px;background:#ffffff">
      ${head}
      ${items}
    </div>
  `
}

function updatePreview() {
  const html = generateReportHTML()
  while (preview.firstChild) {
    preview.removeChild(preview.firstChild)
  }
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const container = doc.body.firstElementChild
  if (container) {
    preview.appendChild(container)
  }
}

async function copyHtml() {
  const html = generateReportHTML()
  const text = html.replace(/<[^>]+>/g, '')
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const item = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' })
      })
      await navigator.clipboard.write([item])
    } else {
      await navigator.clipboard.writeText(text)
    }
  } catch (e) {
    await navigator.clipboard.writeText(text)
  }
}

function resetAll() {
  state = { meta: { title: '', date: todayISO(), author: '' }, tasks: [] }
  dateInput.value = state.meta.date
  setAutoTitleFromDate()
  titleInput.readOnly = false
  authorInput.value = ''
  renderTasks()
  saveState()
  updatePreview()
}

titleInput.addEventListener('input', e => { state.meta.title = e.target.value; saveState(); updatePreview() })
dateInput.addEventListener('input', e => { state.meta.date = e.target.value; setAutoTitleFromDate(); titleInput.readOnly = false; saveState(); updatePreview() })
authorInput.addEventListener('input', e => { state.meta.author = e.target.value; saveState(); updatePreview() })
addTaskBtn.addEventListener('click', addTask)
generateBtn.addEventListener('click', updatePreview)
copyBtn.addEventListener('click', async () => { await copyHtml() })
resetBtn.addEventListener('click', resetAll)

if (!dateInput.value) dateInput.value = todayISO()
loadState()
