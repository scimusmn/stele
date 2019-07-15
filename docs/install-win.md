# Install Stele on Windows 10
Use the [latest](https://github.com/scimusmn/stele/releases/latest). `stele-win-#.#.#-installer.exe` file to install the app on Windows 10.

This will install Stele in the active user's AppData folder: `C:\Users\username\AppData\Local\Programs\stele\Stele.exe`

This folder is often hidden from non-admin users. 

The installer will also add a Stele menu item in the Windows Start menu.

## Start on boot
If you configure Stele to start on boot via the Stele Settings page, the Windows app will create a registry entry at:
`\HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run`

