// Класс для работы с "БД" в localStorage
class LocalStorageDB {
  constructor(dbName) {
    this.dbName = dbName;
    // Инициализация "БД" (если она еще не существует)
    if (!localStorage.getItem(this.dbName)) {
      localStorage.setItem(this.dbName, JSON.stringify([]));
    }
  }

  // Получить все данные из "БД"
  getAll() {
    const data = localStorage.getItem(this.dbName);
    return JSON.parse(data);
  }

  // Добавить новую запись
  add(record) {
    const data = this.getAll();
    data.push(record);
    localStorage.setItem(this.dbName, JSON.stringify(data));
  }

  // Найти запись по ID (предполагаем, что у каждой записи есть уникальный ID)
  findById(id) {
    const data = this.getAll();
    return data.find((item) => item.id === id);
  }

  // Обновить запись по ID
  update(id, newRecord) {
    const data = this.getAll();
    const index = data.findIndex((item) => item.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...newRecord };
      localStorage.setItem(this.dbName, JSON.stringify(data));
    } else {
      console.error("Запись не найдена");
    }
  }

  // Удалить запись по ID
  delete(id) {
    const data = this.getAll();
    const filteredData = data.filter((item) => item.id !== id);
    localStorage.setItem(this.dbName, JSON.stringify(filteredData));
  }

  // Очистить всю "БД"
  clear() {
    localStorage.setItem(this.dbName, JSON.stringify([]));
  }
}
