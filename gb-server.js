const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/startvm', (req, res) => {
  const vmName = req.body.vmName;
  if (!vmName) return res.status(400).send('VM-Name fehlt.');

  const command = `"C:\\Program Files (x86)\\VBox\\VBoxManage.exe" startvm "${vmName}" --type headless`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Fehler: ${error.message}`);
      return res.status(500).send(`Fehler beim Starten der VM: ${error.message}`);
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(500).send(`Fehlerausgabe: ${stderr}`);
    }
    console.log(`stdout: ${stdout}`);
    res.send(`VM "${vmName}" wurde erfolgreich gestartet!`);
  });
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
