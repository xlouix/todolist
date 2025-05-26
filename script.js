const form = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const categorySelect = document.getElementById('task-category');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || [];

// Garante que todas as tarefas tenham o campo 'concluida'
tasks = tasks.map(task => ({
  ...task,
  concluida: task.concluida === undefined ? false : task.concluida
}));

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function saveCategories() {
  localStorage.setItem('categories', JSON.stringify(categories));
}

function renderCategories() {
  categorySelect.innerHTML = '<option value="">Selecione uma Categoria</option>';
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

function renderTasks(filterCategory = '') {
  taskList.innerHTML = '';
  const today = new Date().toISOString().split('T')[0]; // Data atual no formato YYYY-MM-DD
  const filteredTasks = filterCategory ? tasks.filter(task => task.categoria === filterCategory) : tasks;

  filteredTasks.forEach((task, index) => {
    const li = document.createElement('li');

    let prioridadeClasse = task.prioridade.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const isAtrasada = task.data && task.data < today; // Verifica se a tarefa está atrasada
    li.className = `task ${prioridadeClasse} ${isAtrasada ? 'atrasada' : ''}`;
    li.style.listStyle = "none";
    li.style.marginBottom = "1.5rem";

    const checkedAttr = task.concluida ? 'checked' : '';
    const textStyle = task.concluida ? 'text-decoration-line-through text-muted' : '';

    // Verifica se está em modo de edição
    if (task.editing) {
      // Cria select de categorias
      let categoryOptions = categories.map(cat =>
        `<option value="${cat}" ${cat === task.categoria ? 'selected' : ''}>${cat}</option>`
      ).join('');
      // Cria select de prioridade
      let priorityOptions = ['Baixa', 'Média', 'Alta'].map(prio =>
        `<option value="${prio}" ${prio === task.prioridade ? 'selected' : ''}>${prio}</option>`
      ).join('');

      li.innerHTML = `
        <div class="card shadow-sm border-0" style="transition: box-shadow 0.2s; border-radius: 1rem;">
          <div class="card-body p-4" style="background: #f8f9fa; border-radius: 1rem; position: relative;">
            <div class="d-flex align-items-center mb-3">
              <input class="form-check-input me-3" type="checkbox" id="check-${index}" onchange="toggleComplete(${index})" ${checkedAttr} style="transform: scale(1.3);" disabled>
              <span class="fw-semibold fs-5 ${textStyle}">${task.titulo}</span>
            </div>
            <div class="d-flex justify-content-end align-items-center mb-2" style="gap: 0.3rem;">
              <select id="edit-category-${index}" class="form-select form-select-sm" style="width:auto;display:inline-block;">${categoryOptions}</select>
              <select id="edit-priority-${index}" class="form-select form-select-sm ms-2" style="width:auto;display:inline-block;">
                ${priorityOptions}
              </select>
              ${isAtrasada ? '<span class="badge bg-danger ms-2 px-2 py-1" style="font-size: 0.80em;">Atrasada</span>' : ''}
            </div>
            <div class="d-flex align-items-center mt-3" style="min-height:2.2rem;">
              <small class="text-muted">${task.data ? task.data : ''}</small>
              <div style="flex:1"></div>
              <button onclick="saveEditTask(${index})" class="btn btn-sm btn-success px-2 py-1 ms-2" style="border-radius: 0.7rem; font-size:0.75em;">
                <i class="bi bi-check2"></i> Salvar
              </button>
              <button onclick="cancelEditTask(${index})" class="btn btn-sm btn-secondary px-2 py-1 ms-2" style="border-radius: 0.7rem; font-size:0.75em;">
                <i class="bi bi-x"></i> Cancelar
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      li.innerHTML = `
        <div class="card shadow-sm border-0" style="transition: box-shadow 0.2s; border-radius: 1rem;">
          <div class="card-body p-4" style="background: #f8f9fa; border-radius: 1rem; position: relative;">
            <div class="d-flex align-items-center mb-3">
              <input class="form-check-input me-3" type="checkbox" id="check-${index}" onchange="toggleComplete(${index})" ${checkedAttr} style="transform: scale(1.3);">
              <span class="fw-semibold fs-5 ${textStyle}">${task.titulo}</span>
            </div>
            <div class="d-flex justify-content-end align-items-center mb-2" style="gap: 0.3rem;">
              <span class="badge bg-secondary px-2 py-1" style="font-size: 0.80em;">${task.categoria}</span>
              <span class="badge ${task.prioridade === 'Alta' ? 'bg-danger' : task.prioridade === 'Média' ? 'bg-warning text-dark' : 'bg-success'} px-2 py-1" style="font-size: 0.80em;">
                ${task.prioridade}
              </span>
              ${isAtrasada ? '<span class="badge bg-danger ms-2 px-2 py-1" style="font-size: 0.80em;">Atrasada</span>' : ''}
            </div>
            <div class="d-flex align-items-center mt-3" style="min-height:2.2rem;">
              <small class="text-muted">${task.data ? task.data : ''}</small>
              <div style="flex:1"></div>
              <button onclick="editTask(${index})" class="btn btn-sm btn-outline-primary px-2 py-1 ms-2" style="border-radius: 0.7rem; font-size:0.75em;">
                <i class="bi bi-pencil"></i> Editar
              </button>
              <button onclick="deleteTask(${index})" class="btn btn-sm btn-outline-danger px-2 py-1 ms-2" style="border-radius: 0.7rem; font-size:0.75em;">
                <i class="bi bi-trash"></i> Excluir
              </button>
            </div>
          </div>
        </div>
      `;
    }

    // Efeito hover moderno
    li.querySelector('.card').addEventListener('mouseenter', function() {
      this.style.boxShadow = "0 4px 24px rgba(0,0,0,0.10), 0 1.5px 4px rgba(0,0,0,0.08)";
    });
    li.querySelector('.card').addEventListener('mouseleave', function() {
      this.style.boxShadow = "";
    });

    taskList.appendChild(li);
  });
}

// Funções de edição
window.editTask = function(index) {
  tasks[index].editing = true;
  renderTasks();
};

window.saveEditTask = function(index) {
  const catSel = document.getElementById(`edit-category-${index}`);
  const prioSel = document.getElementById(`edit-priority-${index}`);
  if (catSel && prioSel) {
    tasks[index].categoria = catSel.value;
    tasks[index].prioridade = prioSel.value;
  }
  delete tasks[index].editing;
  saveTasks();
  renderTasks();
};

window.cancelEditTask = function(index) {
  delete tasks[index].editing;
  renderTasks();
};

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const titulo = document.getElementById('task-title').value;
  const categoria = document.getElementById('task-category').value;
  const data = document.getElementById('task-date').value;
  const prioridade = document.getElementById('task-priority').value;

  const newTask = { titulo, categoria, data, prioridade, concluida: false };
  tasks.push(newTask);
  saveTasks();
  renderTasks();

  form.reset();
});

function renderCategoryFilters() {
  const filtersDiv = document.getElementById('category-filters');
  filtersDiv.innerHTML = `
    <button class="btn btn-secondary category-btn" onclick="renderTasks()">Todas as Tarefas</button>
  `;
  categories.forEach(category => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline-primary category-btn';
    btn.textContent = category;
    btn.onclick = () => renderTasks(category);
    filtersDiv.appendChild(btn);
  });
}

function renderCategories() {
  categorySelect.innerHTML = '<option value="">Selecione uma Categoria</option>';
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
  renderCategoryFilters();
}

// Função para adicionar categorias
function addCategory() {
  const categoryName = document.getElementById('category-name').value.trim();
  if (categoryName && !categories.includes(categoryName)) {
    categories.push(categoryName);
    saveCategories();
    renderCategories();
    document.getElementById('category-name').value = ''; // Limpa o campo
  } else {
    alert('Categoria inválida ou já existe!');
  }
}

// Inicializa a aplicação
renderCategories();
renderTasks();
