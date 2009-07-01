; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{D2DE523D-77A0-459C-9F2A-0EF93B58FF43}
AppName=NicoRequest Mikunopop Edition
AppVerName=NicoRequest Mikunopop Edition 1.03
AppPublisher=saihane
AppPublisherURL=http://mikunopop.info/
AppSupportURL=http://mikunopop.info/
AppUpdatesURL=http://mikunopop.info/
DefaultDirName={pf}\Nicoreq Mikunopop Edition
DefaultGroupName=NicoRequest Mikunopop Edition
AllowNoIcons=yes
LicenseFile=C:\Mikunopop\nicoreq\EULA.txt
InfoBeforeFile=C:\Mikunopop\nicoreq\README.txt
OutputBaseFilename=NicoReqMikunopopEdition_103
Compression=lzma
SolidCompression=yes
SetupIconFile=C:\Mikunopop\nicoreq\installer\app.ico
VersionInfoVersion=1.0.3.0
VersionInfoDescription=NicoRequest for Mikunopop community
AppCopyright=saihane, w2k, ExceptionError
WizardImageFile=C:\Mikunopop\nicoreq\installer\wizard.bmp
WizardImageBackColor=clWhite
WizardImageStretch=no
WizardSmallImageFile=C:\Mikunopop\nicoreq\installer\wizard_small.bmp

[Languages]
; Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "japanese"; MessagesFile: "compiler:Languages\Japanese.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "C:\Mikunopop\nicoreq\NicoRequest.hta"; DestDir: "{app}"; Flags: ignoreversion
Source: "C:\Mikunopop\nicoreq\README.txt"; DestDir: "{app}";
; Source: "C:\Mikunopop\nicoreq\README.txt"; DestDir: "{app}"; Flags: isreadme
Source: "C:\Mikunopop\nicoreq\EULA.txt"; DestDir: "{app}";
Source: "C:\Mikunopop\nicoreq\NGIDList.txt"; DestDir: "{app}";
Source: "C:\Mikunopop\nicoreq\settings.js"; DestDir: "{app}"; Flags: confirmoverwrite uninsneveruninstall
Source: "C:\Mikunopop\nicoreq\pnames.js"; DestDir: "{app}";
Source: "C:\Mikunopop\nicoreq\System\*"; DestDir: "{app}\System\";
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{group}\NinoRequest Mikunopop Edition"; Filename: "{app}\NicoRequest.hta"
Name: "{group}\{cm:UninstallProgram,NinoRequest Mikunopop Edition}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\NinoRequest Mikunopop Edition"; Filename: "{app}\NicoRequest.hta"; Tasks: desktopicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\NinoRequest Mikunopop Edition"; Filename: "{app}\NicoRequest.hta"; Tasks: quicklaunchicon

[Run]
Filename: "{app}\NicoRequest.hta"; Description: "{cm:LaunchProgram,NinoRequest Mikunopop Edition}"; Flags: shellexec postinstall skipifsilent

