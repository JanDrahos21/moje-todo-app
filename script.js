const todoList = document.getElementById('todo-list');
const taskInput = document.getElementById('task-input');
const todoForm = document.getElementById('todo-form');
const praceColumn = document.getElementById('prace-column').querySelector('.category-list');
const zivotColumn = document.getElementById('zivot-column').querySelector('.category-list');
const skolaColumn = document.getElementById('skola-column').querySelector('.category-list');
const categorySelect = document.getElementById('category-select');

let tasks = [];

function displayDeleteButton(listItem) {
  const button = document.createElement('button');
  button.textContent = 'Smažko';
  button.addEventListener('click', function() {
    // 1. Najdi index úkolu
    const taskText = listItem.querySelector('.task-text').textContent;
    const taskIndex = tasks.findIndex(function(task) {
      return task.text === taskText;
    });

    // 2. Smaž z array (pouze pokud úkol existuje)
    if (taskIndex !== -1) {
      tasks.splice(taskIndex, 1);
    }

    // 3. Smaž z DOM
    listItem.remove();

    // 4. Ulož změny
    saveTasksToLocalStorage();
    updateTaskCounter();
  });

  return button;
}

function loadTasksFromLocalStorage() {
  // 1. Načti data
  const storedData = localStorage.getItem('todoTasks');

  // 2. Zkontroluj existence
  if (storedData !== null) {
    // 3. Převeď zpět na array
    const loadedTasks = JSON.parse(storedData);

    // 4. Nastav globální tasks
    tasks = loadedTasks;

    // 5. Vyčisti všechny sloupce (ne jen todoList)
    praceColumn.innerHTML = '';
    zivotColumn.innerHTML = '';
    skolaColumn.innerHTML = '';

    // 6. Zobraz každý úkol
    for (let task of tasks) {
      displayTask(task.text, task.category);

      // Pokud byl úkol dokončený, aplikuj styling
      if (task.completed === true) {
        const targetColumn = getColumnByCategory(task.category);
        const lastTask = targetColumn.lastElementChild;
        if (lastTask) {
          lastTask.classList.add('completed'); // Použij CSS třídu místo inline stylů
        }
      }
    }
  }
}

function saveTasksToLocalStorage() {
  localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

function displayCompleteButton(listItem) {
  const button = document.createElement('button');
  button.textContent = 'Vyhotoveno';
  button.addEventListener('click', function() {
    // Použij CSS třídu místo inline stylů
    listItem.classList.add('completed');

    const taskText = listItem.querySelector('.task-text').textContent;
    const taskIndex = tasks.findIndex(function(task) {
      return task.text === taskText;
    });

    if (taskIndex !== -1) {
      tasks[taskIndex].completed = true;
      saveTasksToLocalStorage();
      updateTaskCounter();
    }
  });

  return button;
}

function updateTaskCounter() {
  // ❌ CHYBA: Počítáš všechny <li> v dokumentu!
  // ✅ OPRAVA: Počítej jen úkoly v kategoriích
  const allTasks = document.querySelectorAll('.category-list li');
  let uncompletedCount = 0;

  for (let task of allTasks) {
    // Používej CSS třídu místo inline stylů
    if (!task.classList.contains('completed')) {
      uncompletedCount++;
    }
  }
  document.getElementById('task-counter').textContent = `Máš ${uncompletedCount} na účtu, šlapačko`;
}

function displayTask(taskText, taskCategory) {
  console.log("=== CREATING TASK:", taskText, "===");

  // Vytvoř nový <li> element
  const listItem = document.createElement('li');

  // Nastav mu text
  const textSpan = document.createElement('span');
  textSpan.textContent = taskText;
  textSpan.className = 'task-text';
  listItem.appendChild(textSpan);

  const completeBtn = displayCompleteButton(listItem);
  const deleteBtn = displayDeleteButton(listItem);

  // Přidej tlačítka
  listItem.appendChild(completeBtn);
  listItem.appendChild(deleteBtn);

  // Přidej do správného sloupce
  const targetColumn = getColumnByCategory(taskCategory);
  targetColumn.appendChild(listItem);

  // Double-click editace
  listItem.addEventListener('dblclick', function() {
    console.log("🎯 DOUBLECLICK TRIGGERED");

    const textSpan = listItem.querySelector('.task-text');
    const originalText = textSpan.textContent.trim();

    const input = document.createElement('input');
    input.value = originalText;
    input.type = 'text';
    input.className = 'task-input'; // Změň třídu pro správný styling

    // Nahraď span inputem
    listItem.replaceChild(input, textSpan);
    input.focus();

    // Funkce pro dokončení editace
    function finishEdit(newText) {
      const newSpan = document.createElement('span');
      newSpan.textContent = newText || originalText;
      newSpan.className = 'task-text';
      listItem.replaceChild(newSpan, input);

      // Aktualizuj v tasks array
      const taskIndex = tasks.findIndex(task => task.text === originalText);
      if (taskIndex !== -1 && newText && newText !== originalText) {
        tasks[taskIndex].text = newText;
        saveTasksToLocalStorage();
      }
    }

    input.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        finishEdit(input.value.trim());
      } else if (event.key === 'Escape') {
        finishEdit(originalText);
      }
    });

    input.addEventListener('blur', function() {
      finishEdit(input.value.trim());
    });
  });

  console.log("Doubleclick listener added successfully!");
}

function getColumnByCategory(taskCategory) {
  if (taskCategory === 'prace') {
    return praceColumn;
  } else if (taskCategory === 'zivot') {
    return zivotColumn;
  } else if (taskCategory === 'skola') {
    return skolaColumn;
  } else {
    // Fallback pro prázdný className nebo jakýkoliv jiný
    return praceColumn;
  }
}

function handleSubmit(event) {
  event.preventDefault();
  const taskText = taskInput.value.trim(); // Přidej .trim()

  if (taskText === '') {
    console.log("Empty task - not adding");
    return;
  }

  // ✅ Vytvoř objekt s text + completed
  const taskObject = {
    text: taskText,
    completed: false,
    category: categorySelect.value
  };

  tasks.push(taskObject);
  taskInput.value = '';
  displayTask(taskText, taskObject.category);
  saveTasksToLocalStorage(); // Přidej chybějící středník

  updateTaskCounter();
  console.log("All tasks:", tasks);
}

todoForm.addEventListener('submit', handleSubmit);

// Debug informace
console.log("=== TODO APP LOADED ===");
console.log("JavaScript is working!");
console.log("displayTask function exists:", typeof displayTask);
console.log("DOM elements found:");
console.log("- todoList:", todoList);
console.log("- taskInput:", taskInput);
console.log("- todoForm:", todoForm);
console.log("- praceColumn:", praceColumn);
console.log("- zivotColumn:", zivotColumn);
console.log("- skolaColumn:", skolaColumn);

// Na konec kódu (za debug informace)
loadTasksFromLocalStorage();
