# 📌 Script : generate-dependencies-report.ps1
# Objectif : Générer un rapport Markdown des dépendances et vulnérabilités avec encodage UTF-8 BOM

# --- Vérifications de base ---
if (-not (Test-Path "package.json")) {
    Write-Error "❌ Aucun package.json trouvé. Place-toi dans le dossier racine de ton projet frontend."
    exit 1
}

if (-not (Test-Path "package-lock.json")) {
    Write-Error "❌ Aucun package-lock.json trouvé. Lance 'npm install' pour le générer."
    exit 1
}

if (-not (Test-Path "node_modules")) {
    Write-Error "❌ Aucun dossier node_modules trouvé. Lance 'npm install' avant de relancer le script."
    exit 1
}

# --- Création du dossier doc ---
$docPath = "doc"
if (-not (Test-Path $docPath)) {
    New-Item -ItemType Directory -Path $docPath | Out-Null
}

# --- Fichier de sortie ---
$outputFile = Join-Path $docPath "dependencies-report.md"

# --- Récupération des dépendances ---
Write-Host "📦 Récupération des dépendances..."
$deps = npm list --depth=0 --json | ConvertFrom-Json

# --- Audit des vulnérabilités ---
Write-Host "🔍 Audit des vulnérabilités..."
$audit = npm audit --json | ConvertFrom-Json

# --- Construction du rapport ---
$mdContent = @()
$mdContent += "# Rapport des dépendances front-end"
$mdContent += ""
$mdContent += "## Liste des dépendances installées"
$mdContent += ""
$mdContent += "| Dépendance | Version installée |"
$mdContent += "|------------|-------------------|"

foreach ($package in $deps.dependencies.PSObject.Properties) {
    $mdContent += ("| {0} | {1} |" -f $package.Name, $package.Value.version)
}

$mdContent += ""
$mdContent += "## Vulnérabilités détectées"
$mdContent += ""

if ($audit.advisories -and $audit.advisories.Count -gt 0) {
    $mdContent += "| Module | Gravité | Titre | URL |"
    $mdContent += "|--------|---------|-------|-----|"

    foreach ($adv in $audit.advisories.PSObject.Properties.Value) {
        $mdContent += ("| {0} | {1} | {2} | {3} |" -f `
            $adv.module_name, `
            $adv.severity, `
            $adv.title, `
            $adv.url)
    }
}
else {
    $mdContent += "✅ Aucune vulnérabilité détectée."
}

# --- Écriture du fichier en UTF-8 avec BOM ---
$utf8WithBom = New-Object System.Text.UTF8Encoding($true)
[System.IO.File]::WriteAllLines($outputFile, $mdContent, $utf8WithBom)

Write-Host "✅ Rapport généré dans $outputFile"
