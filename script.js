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

      // 2. Smaž z array
      tasks.splice(taskIndex, 1);  // ✅ Správná syntax!

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
    todoList.innerHTML = '';

    // 5. Zobraz každý úkol
    for (let task of tasks) {
      displayTask(task.text, task.category);  // jen text, ne celý objekt


    // Pokud byl úkol dokončený, aplikuj styling
    if (task.completed === true) {
      const lastTask = todoList.lastElementChild;
      lastTask.style.textDecoration = 'line-through';
      lastTask.style.color = 'black';
    }}
  }

}


function saveTasksToLocalStorage() {
  localStorage.setItem('todoTasks', JSON.stringify(tasks));



}


function displayCompleteButton(listItem) {
  const button = document.createElement('button');
  button.textContent = 'Vyhotoveno';
  button.addEventListener('click', function() {
    listItem.style.textDecoration = 'line-through';
    listItem.style.color = 'black';

    const taskText = listItem.querySelector('.task-text').textContent;
    const taskIndex = tasks.findIndex(function(task) {
      return task.text === taskText;
    });
    tasks[taskIndex].completed = true;
    saveTasksToLocalStorage();
    updateTaskCounter();


  });

  return button;


}

function updateTaskCounter() {
  const allTasks = document.querySelectorAll('li');  // ← Všechny li v dokumentu
  let uncompletedCount = 0;

  for (let task of allTasks) {
    if (task.style.textDecoration !== 'line-through') {
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

  // Přidej ho do <ul>
  listItem.appendChild(completeBtn);
  listItem.appendChild(deleteBtn);

  const targetColumn = getColumnByCategory(taskCategory);
  targetColumn.appendChild(listItem);



  listItem.addEventListener('dblclick', function() {
    console.log("🎯 DOUBLECLICK TRIGGERED");

    const textSpan = listItem.querySelector('.task-text');
    const originalText = textSpan.textContent.trim();

    const input = document.createElement('input');
    input.value = originalText;
    input.type = 'text';
    input.className = 'task-text';

    // Nahraď span inputem
    listItem.replaceChild(input, textSpan);
    input.focus();

    input.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        if (input.value.trim() === '') {
          // Prázdný text → vrať původní
          listItem.childNodes[0].textContent = originalText;
        } else {
          // Neprázdný → ulož nový
          listItem.childNodes[0].textContent = input.value;
        }
        input.remove();


      } else if (event.key === 'Escape') {
        const newSpan = document.createElement('span');
        newSpan.textContent = originalText;
        newSpan.className = 'task-text';
        listItem.replaceChild(newSpan, input);
      }
    });

    input.addEventListener('blur', function() {
      const newSpan = document.createElement('span');
      newSpan.textContent = input.value;
      newSpan.className = 'task-text';
      listItem.replaceChild(newSpan, input);
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
  const taskText = taskInput.value;

  if (taskText.trim() === '') {
    console.log("Empty task - not adding");
    return;
  }

  // ✅ Vytvoř objekt s text + completed
  const taskObject = {
    text: taskText,
    completed: false,
    category: categorySelect.value
  };

  tasks.push(taskObject);  // ✅ Ulož objekt místo stringu
  taskInput.value = '';
  displayTask(taskText, taskObject.category);
  saveTasksToLocalStorage()

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

// Na konec kódu (za debug informace)
loadTasksFromLocalStorage();