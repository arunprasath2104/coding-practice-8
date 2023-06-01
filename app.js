const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

const dbpath = path.join(__dirname, "todoApplication.db");
const app = express();
app.use(express.json());
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("aaaaa");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();
//////////////////////////////////////////////////

const hasPriorityAndStatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const hasPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status } = request.query;
  let data = null;
  let getNeededQuery = "";

  switch (true) {
    case hasPriorityAndStatus(request.query):
      getNeededQuery = `
             SELECT *
             FROM todo
             WHERE
               todo LIKE '%${search_q}%'
               AND priority = '${priority}'
               AND status = '${status}';`;
      break;
    case hasPriority(request.query):
      getNeededQuery = `
      SELECT *
            FROM todo
            WHERE
            todo LIKE '%${search_q}%'
            AND priority = '${priority}';`;
      break;
    case hasStatus(request.query):
      getNeededQuery = `
      SELECT *
      FROM todo
      WHERE
        toto LIKE '%${search_q}%'
        AND status = '${status}';`;
      break;
    default:
      getNeededQuery = `
      SELECT
       *
      FROM
       todo
      WHERE
        toto LIKE '%${search_q}%';`;
      break;
  }
  data = await db.all(getNeededQuery);
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const neededTodo = `
    SELECT
     *
    FROM
     todo
    WHERE
     id = ${todoId};`;
  const todo = await db.get(neededTodo);
  response.send(todo);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postQuery = `
    INSERT INTO 
      todo (id,todo,priority,status)
    VALUES
      (${id},'${todo}','${priority}',${status});`;
  await db.run(postQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const column = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.todo !== undefined:
      column = "Todo";
      break;
    case requestBody.priority !== undefined:
      column = "Priority";
      break;
    case requestBody.status !== undefined:
      column = "Status";
      break;
  }
  const putQuery = `
    SELECT *
    FROM toto
    WHERE 
      id = ${todoId};`;
  const neededTodo = await db.get(putQuery);

  const {
    todo = neededTodo.todo,
    priority = neededTodo.priority,
    status = neededTodo.status,
  } = request.body;

  const updateTodo = `
    UPDATE
      todo
    SET 
      todo = '${todo}',
      priority = '${priority}',
      status = '${status}'`;
  await db.run(updateTodo);

  response.send(`${column} Updated`);
});

//////////////////////////////////////////////////////////

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  deleteTodo = `
   DELETE FROM todo
   WHERE id = ${todoId}`;
  await db.run(deleteTodo);
  response.send("Todo Deleted");
});
module.exports = app;
