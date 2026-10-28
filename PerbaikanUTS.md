# Dokumentasi Perbaikan UTS — Absensi Pintar

## 2. Perbaikan yang Telah Dilakukan

### 2.1. Rename File Berakhiran `fix.tsx`
**Status: Selesai**

Seluruh file yang sebelumnya menggunakan akhiran `fix.tsx` telah diubah menjadi nama file final yang lebih rapi dan sesuai dengan fungsinya. Perubahan ini dilakukan agar struktur proyek lebih profesional dan siap untuk dipresentasikan.

![alt text](image-9.png)

### 2.2. Pengujian pada Emulator Mobile
**Status: Sedang Berjalan**

Pengujian aplikasi pada emulator mobile masih dalam proses. Pengujian perlu dilakukan menggunakan lingkungan Expo dan emulator mobile yang sesuai, bukan hanya mengandalkan tampilan berbasis web.

Saat ini, proses pengujian terkendala kebutuhan upgrade ke **SDK 58**. Setelah proses upgrade selesai, aplikasi akan diuji kembali untuk memastikan seluruh fitur berjalan dengan baik pada perangkat mobile.

Namun masih ada kendala terkait expo go, karena project memakai SDK 57, sedangkat expo go support di SDK 58. Usaha sudah di lakukan, namun masih belum menemukan solusinya. jadi kami memerlukan bantuan dari dosen.

› Installing 1 other package using npm
› Using ^58.0.0 instead of ~57.0.31 for expo because this version was explicitly provided. Packages excluded from dependency validation should be listed in expo.install.exclude in package.json. Learn more: https://docs.expo.dev/more/expo-cli/#configuring-dependency-validation
> npm install

added 79 packages, removed 2 packages, changed 24 packages, and audited 1003 packages in 43s

187 packages are looking for funding
  run `npm fund` for details

13 vulnerabilities (5 low, 5 moderate, 3 high)

To address all issues possible (including breaking changes), run:
  npm audit fix --force

Some issues need review, and may require choosing
a different dependency.

Run `npm audit` for details.
npm warn install-scripts 1 package has install scripts not yet covered by allowScripts:
npm warn install-scripts   unrs-resolver@1.12.2 (postinstall: node postinstall.js)
npm warn install-scripts
npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
› Running npx expo install under the updated expo version
> expo install --fix
The following packages should be updated for best compatibility with the installed expo version:
  @expo/ui@57.0.26 - expected version: ~58.0.24
  expo-constants@57.0.22 - expected version: ~58.0.13
  expo-device@57.0.2 - expected version: ~58.0.5
  expo-font@57.0.4 - expected version: ~58.0.10
  expo-glass-effect@57.0.4 - expected version: ~58.0.5
  expo-image@57.0.5 - expected version: ~58.0.17
  expo-linking@57.0.13 - expected version: ~58.0.14
  expo-router@57.0.29 - expected version: ~58.0.27
  expo-splash-screen@57.0.10 - expected version: ~58.0.11
  expo-status-bar@57.0.1 - expected version: ~58.0.4
  expo-symbols@57.0.3 - expected version: ~58.0.4
  expo-system-ui@57.0.4 - expected version: ~58.0.6
  expo-web-browser@57.0.3 - expected version: ~58.0.7
  react@19.2.3 - expected version: 19.3.0
  react-dom@19.2.3 - expected version: 19.3.0
  react-native@0.86.3 - expected version: 0.88.0
  react-native-gesture-handler@2.32.0 - expected version: ~3.3.0
  react-native-reanimated@4.5.1 - expected version: 4.7.1
  react-native-safe-area-context@5.7.0 - expected version: ~5.10.1
  react-native-screens@4.26.2 - expected version: ~4.30.0
  react-native-web@0.21.3 - expected version: ^0.21.4
  react-native-worklets@0.10.1 - expected version: 0.13.0
  @types/react@19.2.18 - expected version: ~19.3.0
  eslint-config-expo@57.0.2 - expected version: ~58.0.4
Your project may not work correctly until you install the expected versions of the packages.
› Installing 24 SDK 58.0.0 compatible native modules using npm
> npm install
npm error code ERESOLVE
npm error ERESOLVE could not resolve
npm error
npm error While resolving: kelompok3@1.0.0
npm error Found: expo-router@57.0.29
npm error node_modules/expo-router
npm error   expo-router@"~58.0.27" from the root project
npm error
npm error Could not resolve dependency:
npm error expo-router@"~58.0.27" from the root project
npm error
npm error Conflicting peer dependency: expo-symbols@58.0.4
npm error node_modules/expo-symbols
npm error   peerOptional expo-symbols@"^58.0.4" from expo-router@58.0.27
npm error   node_modules/expo-router
npm error     expo-router@"~58.0.27" from the root project
npm error
npm error Fix the upstream dependency conflict, or retry this command with --force or --legacy-peer-deps to accept an incorrect (and potentially broken) dependency resolution.
npm error
npm error
npm error For a full report see:
npm error C:\Users\arief\AppData\Local\npm-cache\_logs\2026-10-28T14_51_57_982Z-eresolve-report.txt
npm error A complete log of this run can be found in: C:\Users\arief\AppData\Local\npm-cache\_logs\2026-10-28T14_51_57_982Z-debug-0.log
Error: npm install exited with non-zero code: 1
Error: npm install exited with non-zero code: 1
    at ChildProcess.completionListener (C:\Users\arief\OneDrive\Dokumen\TUGAS KULYEAH SMT 5\Project_Lab_Kelompok3\Kelompok3\node_modules\@expo\spawn-async\build\spawnAsync.js:113:23)
    at ChildProcess.wrapper (node:events:639:12)
    at ChildProcess.emit (node:events:514:28)
    at cp.emit (C:\Users\arief\OneDrive\Dokumen\TUGAS KULYEAH SMT 5\Project_Lab_Kelompok3\Kelompok3\node_modules\cross-spawn\lib\enoent.js:34:29)
    at ChildProcess._handle.onexit (node:internal/child_process:295:12)
    ...
    at spawnAsync (C:\Users\arief\OneDrive\Dokumen\TUGAS KULYEAH SMT 5\Project_Lab_Kelompok3\Kelompok3\node_modules\@expo\spawn-async\build\spawnAsync.js:9:23)
    at NpmPackageManager.runAsync (C:\Users\arief\OneDrive\Dokumen\TUGAS KULYEAH SMT 5\Project_Lab_Kelompok3\Kelompok3\node_modules\@expo\package-manager\build\node\BasePackageManager.js:75:42)
    at C:\Users\arief\OneDrive\Dokumen\TUGAS KULYEAH SMT 5\Project_Lab_Kelompok3\Kelompok3\node_modules\@expo\package-manager\build\node\NpmPackageManager.js:68:143
    at C:\Users\arief\OneDrive\Dokumen\TUGAS KULYEAH SMT 5\Project_Lab_Kelompok3\Kelompok3\node_modules\@expo\package-manager\build\utils\spawn.js:20:34
Error: npx expo install --fix exited with non-zero code: 1
Error: npx expo install --fix exited with non-zero code: 1
    at ChildProcess.completionListener (C:\Users\arief\OneDrive\Dokumen\TUGAS KULYEAH SMT 5\Project_Lab_Kelompok3\Kelompok3\node_modules\@expo\spawn-async\build\spawnAsync.js:113:23)
    at ChildProcess.wrapper (node:events:639:12)
    at ChildProcess.emit (node:events:514:28)
    at cp.emit (C:\Users\arief\OneDrive\Dokumen\TUGAS KULYEAH SMT 5\Project_Lab_Kelompok3\Kelompok3\node_modules\cross-spawn\lib\enoent.js:34:29)
    at ChildProcess._handle.onexit (node:internal/child_process:295:12)
    ...
    at spawnAsync (C:\Users\arief\OneDrive\Dokumen\TUGAS KULYEAH SMT 5\Project_Lab_Kelompok3\Kelompok3\node_modules\@expo\spawn-async\build\spawnAsync.js:9:23)
    at installExpoPackageAsync (C:\Users\arief\OneDrive\Dokumen\TUGAS KULYEAH SMT 5\Project_Lab_Kelompok3\Kelompok3\node_modules\expo\node_modules\@expo\cli\build\src\install\installExpoPackage.js:114:41)
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async installPackagesAsync (C:\Users\arief\OneDrive\Dokumen\TUGAS KULYEAH SMT 5\Project_Lab_Kelompok3\Kelompok3\node_modules\expo\node_modules\@expo\cli\build\src\install\installAsync.js:176:16)