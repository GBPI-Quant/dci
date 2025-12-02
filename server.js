const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const app = express();
const port = 3000;

// Installierte VMs
const VMS = ['Windows', 'Alma'];

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Start VM
app.post('/startvm', (req, res) => {
  const vmName = req.body.vmName;
  if (!VMS.includes(vmName)) return res.status(400).send('Unbekannte VM.');

  const command = `"C:\\Program Files\\Oracle\\VirtualBox\\VBoxManage.exe" startvm "${vmName}" --type headless`;
  exec(command, (error, stdout, stderr) => {
    if (error) return res.status(500).send(`Fehler beim Starten: ${error.message}`);
    res.send(`VM "${vmName}" wurde gestartet!`);
  });
});

// Stop VM
app.post('/stopvm', (req, res) => {
  const vmName = req.body.vmName;
  if (!VMS.includes(vmName)) return res.status(400).send('Unbekannte VM.');

  const command = `"C:\\Program Files\\Oracle\\VirtualBox\\VBoxManage.exe" controlvm "${vmName}" acpipowerbutton`;
  exec(command, (error, stdout, stderr) => {
    if (error) return res.status(500).send(`Fehler beim Stoppen: ${error.message}`);
    res.send(`VM "${vmName}" wird gestoppt!`);
  });
});

// Status VM
app.get('/statusvm/:vmName', (req, res) => {
  const vmName = req.params.vmName;
  if (!VMS.includes(vmName)) return res.status(400).json({ running: false, status: 'unknown' });

  exec(`"C:\\Program Files\\Oracle\\VirtualBox\\VBoxManage.exe" showvminfo "${vmName}" --machinereadable`, (err, stdout) => {
    if (err) return res.status(500).json({ running: false, status: 'error' });

    let statusMatch = stdout.match(/VMState="(.*?)"/);
    let status = statusMatch ? statusMatch[1] : 'unknown';
    let running = status === 'running';
    res.json({ running, status, info: stdout });
  });
});

// Ressourcen & Laufzeit
app.get('/resources/:vmName', (req, res) => {
  const vmName = req.params.vmName;
  if (!VMS.includes(vmName)) return res.status(400).json({});

  exec(`"C:\\Program Files\\Oracle\\VirtualBox\\VBoxManage.exe" showvminfo "${vmName}" --machinereadable`, (err, stdout) => {
    if (err) return res.status(500).json({});
    const cpuMatch = stdout.match(/cpus="(\d+)"/);
    const ramMatch = stdout.match(/memory="(\d+)"/);
    const diskMatch = stdout.match(/VDI=.*size=(\d+)/);
    const startTimeMatch = stdout.match(/VMStateChangeTime="(.*?)"/);

    res.json({
      cpu: cpuMatch ? cpuMatch[1] : 'n/a',
      ram: ramMatch ? ramMatch[1] : 'n/a',
      disk: diskMatch ? diskMatch[1] : 'n/a',
      startTime: startTimeMatch ? startTimeMatch[1] : null
    });
  });
});

// Liste aller VMs
app.get('/listvms', (req, res) => {
  res.json(VMS);
});

// Start Server
app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});


