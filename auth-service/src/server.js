const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(` API sécurité JWT & rôles sur http://localhost:${PORT}`);
});
