param(
    [string]$UpdateNode = ""
)

Clear-Host
$ErrorActionPreference = 'Stop'
# Exit

function envPathContains([string]$directory) {
    return ($Env:Path -split ';').TrimEnd('\') -contains $directory.TrimEnd('\')
}

function download([string]$url, [string]$filePath) {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls13, [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -UseBasicParsing $url -OutFile $filePath -ErrorAction Stop
}

function unzip([string]$zipFilePath, [string]$extractPath) {
    Expand-Archive -LiteralPath $zipFilePath -DestinationPath $extractPath -Force
}

$nodePath = "C:\w3\software\PortableNode\"
Write-Host " "
Write-Host "Node path: $nodePath" -ForegroundColor Yellow
Write-Host " "

if ( ! $UpdateNode -and (Test-Path $nodePath"node.exe" -PathType Leaf) )
{
    Write-Host "Skip downloading NodeJS" -ForegroundColor Green
} else
{
    # TODO get the latest URL
    $url = "https://nodejs.org/dist/v22.16.0/node-v22.16.0-win-x64.zip"
    $fileName = ([uri]$url).Segments[-1]
    if (! (Test-Path $fileName -PathType Leaf) )
    {
        Write-Host " "
        Write-Host "Downloading NodeJS from $url" -ForegroundColor Yellow
        Write-Host " "
        download $url $fileName
    }
    # If the file not exists

    New-Item -Path $nodePath -ItemType Directory -ErrorAction SilentlyContinue

    if ($UpdateNode)
    {
        Get-ChildItem $nodePath* | Remove-Item -Recurse
    }
    # Empty folder if UpdateNode

    if ( ! $UpdateNode -and (Test-Path $nodePath*) )
    {
        Write-Host "Skip unzipping to $nodePath" -ForegroundColor Green
    } else
    {
        Write-Host " "
        Write-Host "Unzipping $fileName to $nodePath" -ForegroundColor Yellow
        Write-Host " "
        unzip "$fileName" "$nodePath"
        $extractedSubDir = (Get-Item $fileName).Basename + "\"
        Remove-Item $fileName
    }
    # Whether the folder empty or not

    if (Test-Path $nodePath\$extractedSubDir)
    {
        Write-Host " "
        Write-Host "Moving files out of Basename folder" -ForegroundColor Yellow
        Write-Host " "
        Get-ChildItem $nodePath\$extractedSubDir* | Move-Item -Destination $nodePath
        Remove-Item $nodePath\$extractedSubDir
    }
}

if (envPathContains $nodePath)
{
    Write-Host "Skip adding Node path" -ForegroundColor Green
}
else
{
    $env:Path += ";$nodePath"
    Write-Host "Added Node path"
}

$appPath = "C:\w3\react\"
Write-Host " "
Write-Host "App root: $appPath"
Write-Host " "

$appDir = $(Write-Host "Enter your app folder/name [hello]" -ForegroundColor Yellow -NoNewline; Read-Host)
if (! $appDir)
{
    $appDir = "hello"
}
New-Item -Path $appPath$appDir -ItemType Directory -ErrorAction SilentlyContinue
Write-Host "App path: $appPath$appDir" -ForegroundColor Green

Write-Host " "
Write-Host "Initializing React App with TypeScript, ESLint, Tailwind CSS, App Router, Turbopack, @ import alias in src/"  -ForegroundColor Yellow
Write-Host " "

#$packageName = "create-next-app"
#Write-Host " "
#Write-Host "Installing $packageName package" -ForegroundColor Yellow
#Write-Host " "
#npm install -g $packageName
#Write-Host "Uninstalling $packageName" -ForegroundColor Red
#npm uninstall $packageName

Set-Location -Path $appPath -PassThru | Out-Host

npx create-next-app@latest $appDir --typescript --eslint --tailwind --src-dir --app --turbopack --import-alias "@/*"

Set-Location -Path $appPath$appDir  -ErrorAction Stop -PassThru | Out-Host 

Write-Host " "
Write-Host "Installing dependencies"  -ForegroundColor Yellow
Write-Host " "
npm install redux react-redux @reduxjs/toolkit rebass

Write-Host " "
Write-Host "Starting Next.js App..." -ForegroundColor Yellow
Write-Host " "
npm run dev

Write-Host " "
Write-Host "Done"
Write-Host " "
Pause

<#
    .COMMENT TITLE
    The comment

    Define function and ways to call it
    function a(b, [string]c) {}
    a "b" "c"
    a -c "c" -b "b"

    Help <command> -Full
    Get-Command -Name *service*
    Get-Service -Name w32time
    
    TypeName shows the System.ServiceProcess.ServiceController output.
    Get-Service -Name w32time | Get-Member -MemberType All
    The PassThru parameter causes a cmdlet that doesn't usually produce output to generate output.
    Get-Service -Name w32time | Start-Service -PassThru | Get-Member

    Get type of the variable
    (Get-Item $nodePath).getType()

    Commands accept a ServiceController object via pipeline or parameter input.
    Get-Command -ParameterType ServiceController

    $files = Get-ChildItem C:\Windows
#>
# A comment